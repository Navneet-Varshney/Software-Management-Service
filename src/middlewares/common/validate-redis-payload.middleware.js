/**
 * Validate Redis Payload Middleware
 * 
 * First layer of token validation for Admin Panel and Software Management services.
 * Validates that:
 * 1. Access token is present in request headers
 * 2. Redis session exists for the user and device
 * 3. Redis payload structure is valid (contains refreshToken)
 * 4. Token IDs match between frontend token and Redis token
 * 
 * This middleware ensures session integrity before validating JWT payload structure.
 * 
 * @author Custom Auth Service Team
 * @date 2026-03-06
 */

const jwt = require("jsonwebtoken");
const { getRedisClient } = require("@/utils/redis-client.util");
const { buildRedisKey } = require("@/internals/redis-session/redis.key.builder");
const { logWithTime } = require("@utils/time-stamps.util");
const {
    throwAccessDeniedError,
    throwSessionExpiredError,
    throwInternalServerError,
    throwInvalidResourceError,
    logMiddlewareError
} = require("@/responses/common/error-handler.response");
const { clearAccessTokenHeaders, extractAccessToken } = require("@utils/access-token.util");

/**
 * Validates Redis session and token payload integrity
 */
const validateRedisPayloadMiddleware = async (req, res, next) => {
    try {
        // Extract access token from request headers
        const accessToken = extractAccessToken(req);
        const device = req.device;

        if (!accessToken) {
            logMiddlewareError("validateRedisPayloadMiddleware", "❌ Access token missing", req);
            return throwSessionExpiredError(res);
        }

        if (!device || !device.deviceUUID) {
            logMiddlewareError("validateRedisPayloadMiddleware", "❌ Device information missing", req);
            return throwAccessDeniedError(res, "Device information required");
        }

        const deviceId = device.deviceUUID;

        // Decode access token to extract user ID (unsafe decode for ID extraction only)
        let decodedAccess;
        try {
            decodedAccess = jwt.decode(accessToken);
            if (!decodedAccess?.uid) {
                logMiddlewareError("validateRedisPayloadMiddleware", "❌ Access token payload missing user ID", req);
                return throwInvalidResourceError(res, "Access token payload", "Missing or invalid user ID");
            }
        } catch {
            logMiddlewareError("validateRedisPayloadMiddleware", "❌ Failed to decode access token", req);
            return throwAccessDeniedError(res, "Invalid access token");
        }

        // Get Redis client and build key
        const redisClient = getRedisClient();
        const redisKey = buildRedisKey(decodedAccess.uid, deviceId);

        // Fetch session data from Redis
        const tokenDataRaw = await redisClient.get(redisKey);

        if (!tokenDataRaw) {
            logMiddlewareError("validateRedisPayloadMiddleware", `⚠️ Redis entry not found for userId: ${decodedAccess.uid}, deviceId: ${deviceId}`, req);
            clearAccessTokenHeaders(res);
            return throwSessionExpiredError(res);
        }

        // Parse and validate Redis payload structure
        let tokenData;
        try {
            tokenData = JSON.parse(tokenDataRaw);
        } catch (parseError) {
            logMiddlewareError("validateRedisPayloadMiddleware", `❌ Failed to parse Redis data for userId: ${decodedAccess.uid}`, req);
            return throwAccessDeniedError(res, "Corrupted session data");
        }

        // Validate Redis payload contains refresh token
        if (!tokenData.refreshToken) {
            logMiddlewareError("validateRedisPayloadMiddleware", `❌ Redis tokenData missing refresh token for userId: ${decodedAccess.uid}, deviceId: ${deviceId}`, req);
            return throwAccessDeniedError(res, "Redis token structure invalid or corrupted");
        }

        // Decode Redis refresh token
        let redisDecodedRefresh;
        try {
            redisDecodedRefresh = jwt.decode(tokenData.refreshToken);
            if (!redisDecodedRefresh?.uid || redisDecodedRefresh.uid !== decodedAccess.uid) {
                logMiddlewareError("validateRedisPayloadMiddleware", "❌ Redis refresh token ID mismatch", req);
                return throwAccessDeniedError(res, "Refresh token mismatch or exploit detected");
            }
        } catch {
            logMiddlewareError("validateRedisPayloadMiddleware", "❌ Failed to decode Redis refresh token", req);
            return throwAccessDeniedError(res, "Corrupted refresh token in Redis");
        }

        // All validations passed - attach token metadata to request
        req.tokenMeta = {
            refreshToken: tokenData.refreshToken,
            frontEndAccessToken: accessToken,
            decodedAccess: decodedAccess,
            decodedRefresh: redisDecodedRefresh
        };

        logWithTime(`✅ Redis token payload validated for userId: ${decodedAccess.uid}, deviceId: ${deviceId}`);
        return next();
    } catch (err) {
        logMiddlewareError("validateRedisPayloadMiddleware", "❌ Internal error during Redis payload validation", req);
        return throwInternalServerError(res, err);
    }
};

module.exports = { validateRedisPayloadMiddleware };