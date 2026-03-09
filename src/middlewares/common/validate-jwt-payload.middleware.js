/**
 * Validate JWT Payload Middleware
 * 
 * Second layer of token validation for Admin Panel and Software Management services.
 * Validates that:
 * 1. JWT payload structure matches expected schema (shape validation)
 * 2. Field formats are valid (UUID, MongoDB ID patterns)
 * 3. Device IDs match between access and refresh tokens
 * 4. Expiry times are consistent (access expiry < refresh expiry)
 * 
 * This middleware ensures token payload integrity before signature verification.
 * 
 * @author Custom Auth Service Team
 * @date 2026-03-06
 */

const {
  throwAccessDeniedError,
  logMiddlewareError,
  throwInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { tokenPayloads } = require("@configs/token.config");
const { isValidUUID, isValidCustomId } = require("@utils/id-validators.util");
const { validateObjectShape } = require("@utils/object-shape-validator.util");

/**
 * Validates JWT token payload structure and field formats
 */
const validateJwtPayloadMiddleware = (req, res, next) => {
  try {
    const { decodedAccess, decodedRefresh } = req.tokenMeta;

    if (!decodedAccess || !decodedRefresh) {
      logMiddlewareError("validateJwtPayloadMiddleware", "Token metadata missing from request", req);
      return throwAccessDeniedError(res, "Token metadata not found");
    }

    // Required fields for JWT validation
    const requiredFields = tokenPayloads;

    // 🧩 Shape validation for access token
    const accessShapeResult = validateObjectShape(decodedAccess, requiredFields, "Access");
    if (!accessShapeResult.valid) {
      logWithTime(`❌ [validateJwtPayloadMiddleware] Access token malformed`);
      logWithTime(`Missing: ${accessShapeResult.missing.join(", ") || "None"} | Extra: ${accessShapeResult.extra.join(", ") || "None"}`);
      logMiddlewareError("validateJwtPayloadMiddleware", "Access token shape validation failed", req);
      return throwAccessDeniedError(res, "Access token payload malformed");
    }

    // 🧩 Shape validation for refresh token
    const refreshShapeResult = validateObjectShape(decodedRefresh, requiredFields, "Refresh");
    if (!refreshShapeResult.valid) {
      logWithTime(`❌ [validateJwtPayloadMiddleware] Refresh token malformed`);
      logWithTime(`Missing: ${refreshShapeResult.missing.join(", ") || "None"} | Extra: ${refreshShapeResult.extra.join(", ") || "None"}`);
      logMiddlewareError("validateJwtPayloadMiddleware", "Refresh token shape validation failed", req);
      return throwAccessDeniedError(res, "Refresh token payload malformed");
    }

    // 🔍 Regex validation for access token
    if (!isValidUUID(decodedAccess.did)) {
      logWithTime(`❌ [validateJwtPayloadMiddleware] Invalid access token deviceId format`);
      logMiddlewareError("validateJwtPayloadMiddleware", "Access token deviceId validation failed", req);
      return throwAccessDeniedError(res, "Invalid access token deviceId");
    }
    
    if (!isValidCustomId(decodedAccess.uid)) {
      logWithTime(`❌ [validateJwtPayloadMiddleware] Invalid access token uid format`);
      logMiddlewareError("validateJwtPayloadMiddleware", "Access token uid validation failed", req);
      return throwAccessDeniedError(res, "Invalid access token uid");
    }

    // 🔍 Regex validation for refresh token
    if (!isValidUUID(decodedRefresh.did)) {
      logWithTime(`❌ [validateJwtPayloadMiddleware] Invalid refresh token deviceId format`);
      logMiddlewareError("validateJwtPayloadMiddleware", "Refresh token deviceId validation failed", req);
      return throwAccessDeniedError(res, "Invalid refresh token deviceId");
    }

    if (!isValidCustomId(decodedRefresh.uid)) {
      logWithTime(`❌ [validateJwtPayloadMiddleware] Invalid refresh token uid format`);
      logMiddlewareError("validateJwtPayloadMiddleware", "Refresh token uid validation failed", req);
      return throwAccessDeniedError(res, "Invalid refresh token uid");
    }

    // 🔁 Device ID match check
    if (decodedAccess.did !== decodedRefresh.did) {
      logMiddlewareError("validateJwtPayloadMiddleware", "Access and refresh token device ID mismatch", req);
      return throwAccessDeniedError(res, "Token device mismatch");
    }

    // 🔁 User ID match check
    if (decodedAccess.uid !== decodedRefresh.uid) {
      logMiddlewareError("validateJwtPayloadMiddleware", "Access and refresh token User ID mismatch", req);
      return throwAccessDeniedError(res, "Token User ID mismatch");
    }

    // ⏳ Expiry time check
    if (decodedAccess.exp >= decodedRefresh.exp) {
      logMiddlewareError("validateJwtPayloadMiddleware", "Access token expiry must be less than refresh token expiry", req);
      return throwAccessDeniedError(res, "Invalid token expiry structure");
    }

    logWithTime(`✅ JWT payload validated for userId: ${decodedAccess.uid}, deviceId: ${decodedAccess.did}`);
    return next();
  } catch (err) {
    logMiddlewareError("validateJwtPayloadMiddleware", "Internal error during JWT payload validation", req);
    return throwInternalServerError(res, err);
  }
};

module.exports = { validateJwtPayloadMiddleware };