const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { redisClient } = require("@utils/redis-client.util");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage, throwTooManyRequestsError } = require("@/responses/common/error-handler.response");
const { INTERNAL_ERROR } = require("@/configs/http-status.config");

/**
 * Redis-backed Admin & Device-based rate limiter
 * @param {Object} options
 * @param {number} options.maxRequests - Maximum requests allowed
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {string} options.message - Optional custom message
 */

const createRateLimiter = ({ maxRequests, windowMs, message }) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args)
    }),
    
    keyGenerator: (req) => {
      const userId = req?.admin?.adminId || req?.client?.clientId;
      const deviceId = req.device.deviceUUID;
      const path = req.originalUrl || req.url;

      // Note: Make sure this middleware runs AFTER auth/device middleware
      if (!userId || !deviceId) {
        // Log warning but prevent crash by returning a fallback key or throwing explicit error
        throw new Error("User ID or Device ID missing for rate limiter key generation");
      }

      return `${userId}:${deviceId}:${path}`;
    },

    windowMs,
    max: maxRequests,
    
    // Standard message object
    message: {
      message: message || "Too many requests. Please try again after some time."
    },

    standardHeaders: true,
    legacyHeaders: false,

    // 👇 UPDATED HANDLER
    handler: (req, res, next, options) => {
      try {
        // 1. Calculate Retry Time
        const resetTime = req.rateLimit?.resetTime;
        const retryAfterSeconds = resetTime
          ? Math.ceil((resetTime.getTime() - Date.now()) / 1000)
          : null;

        // 2. Optional: Detailed Internal Logging (Development/Debug ke liye)
        const ip = req.ip || req.headers["x-forwarded-for"] || "UNKNOWN_IP";
        const path = req.originalUrl || req.url;
        logWithTime(`🚫 Rate Limit Triggered | IP: ${ip} | Path: ${path}`);

        // 3. 🔥 Use Standard Error Handler
        return throwTooManyRequestsError(res, options.message.message, retryAfterSeconds);

      } catch (err) {
        errorMessage(err);
        return res.status(INTERNAL_ERROR).json({ 
            success: false, 
            message: "Internal Server Error in Rate Limiter" 
        });
      }
    }
  });
};

module.exports = {
  createRateLimiter
};