/**
 * Verify JWT Signature Middleware
 * 
 * Third layer of token validation for Admin Panel and Software Management services.
 * Validates that:
 * 1. Access token signature is valid and not expired
 * 2. Refresh token signature is valid (edge case: access expired)
 * 3. Handles automatic token refresh when access token expires
 * 
 * Edge Case Handler:
 * - If access token expired but refresh token valid, calls Auth Service's
 *   internal post-refresh API to get new access token
 * - Updates response headers with new token and continues request
 * 
 * This middleware extracts userId and deviceId from JWT and attaches them to request.
 * Entity fetching (Admin/User) is handled by downstream factory middleware.
 * 
 * @author Custom Auth Service Team
 * @date 2026-03-06
 */

const jwt = require("jsonwebtoken");
const {
  throwInternalServerError,
  throwSessionExpiredError,
  throwAccessDeniedError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { setAccessTokenHeaders, clearAccessTokenHeaders } = require("@utils/access-token.util");
const { secretCodeOfAccessToken, secretCodeOfRefreshToken } = require("@configs/token.config");
const { refreshAccessTokenFromAuthService } = require("@/internals/internal-client/custom-auth-service.client");

/**
 * Verifies JWT signatures and handles token refresh
 */
const verifyJWTSignatureMiddleware = async (req, res, next) => {
  try {
    const { refreshToken, frontEndAccessToken, decodedAccess } = req.tokenMeta;
    const device = req.device;

    if (!device || !device.deviceUUID) {
      logWithTime("❌ Device information missing in verifyJWTSignature");
      return throwAccessDeniedError(res, "Device information required");
    }

    const deviceId = device.deviceUUID;
    let accessTokenValid = false;
    let verifiedAccessToken = null;

    // 🔐 Try to verify access token
    try {
      verifiedAccessToken = jwt.verify(frontEndAccessToken, secretCodeOfAccessToken);
      accessTokenValid = true;
      logWithTime(`✅ Access token verified for userId: ${verifiedAccessToken.uid}`);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        logWithTime("⚠️ Access token expired — checking refresh token");
      } else {
        logWithTime(`❌ Access token verification failed: ${err.message}`);
        return throwAccessDeniedError(res, "Invalid access token");
      }
    }

    // 🔄 Edge Case: Access token expired, try refresh token
    if (!accessTokenValid) {
      let verifiedRefreshToken = null;
      
      try {
        verifiedRefreshToken = jwt.verify(refreshToken, secretCodeOfRefreshToken);
        logWithTime("✅ Refresh token valid — initiating token refresh");
      } catch (refreshErr) {
        logWithTime("❌ Both access and refresh tokens expired");
        clearAccessTokenHeaders(res);
        return throwSessionExpiredError(res);
      }

      // Call Auth Service's internal post-refresh API
      try {
        const userId = verifiedRefreshToken.uid;
        const refreshResult = await refreshAccessTokenFromAuthService(refreshToken, deviceId, userId);
        
        if (!refreshResult.success) {
          const errorMsg = typeof refreshResult.error === 'object' 
            ? JSON.stringify(refreshResult.error) 
            : refreshResult.error;
          logWithTime(`❌ Token refresh failed [${refreshResult.statusCode || 'N/A'}]: ${errorMsg}`);
          clearAccessTokenHeaders(res);
          return throwSessionExpiredError(res);
        }

        // Set new access token in response headers
        setAccessTokenHeaders(res, refreshResult.newAccessToken);
        
        // Verify the new access token
        verifiedAccessToken = jwt.verify(refreshResult.newAccessToken, secretCodeOfAccessToken);
        
        // Update tokenMeta with new access token
        req.tokenMeta.frontEndAccessToken = refreshResult.newAccessToken;
        req.tokenMeta.decodedAccess = verifiedAccessToken;
        
        logWithTime(`✅ Access token refreshed successfully for userId: ${verifiedAccessToken.uid}`);
      } catch (refreshError) {
        logWithTime(`❌ Error during token refresh: ${refreshError.message}`);
        clearAccessTokenHeaders(res);
        return throwInternalServerError(res, refreshError);
      }
    }

    // 🧠 Extract userId and deviceId from token
    const userId = verifiedAccessToken.uid;

    // Attach userId and deviceId to req for downstream factory middleware
    // Note: Actual entity (Admin/User) will be fetched by factory middleware based on userId prefix
    // These will be cleaned up after successful entity fetch
    req.userId = userId;

    logWithTime(`✅ JWT verified: userId=${userId}, deviceId=${deviceId}`);
    return next();
  } catch (err) {
    logWithTime("❌ Internal error during token signature verification");
    return throwInternalServerError(res, err);
  }
};

module.exports = { verifyJWTSignatureMiddleware };