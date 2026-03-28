// middlewares/factory/check-phase-frozen.middleware-factory.js

const {
  throwAccessDeniedError,
  logMiddlewareError,
  throwInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * Factory: Creates a middleware to check if a phase is frozen
 * 
 * @param {string} phaseString - The phase name (e.g., "inception", "elicitation", "elaboration", etc.)
 * @returns {Function} - Middleware function
 * 
 * Usage:
 *   const checkInceptionFrozen = createCheckPhaseFrozenMiddleware("inception");
 *   router.post("/route", checkInceptionFrozen, controller);
 */
const createCheckPhaseFrozenMiddleware = (phaseString) => {
  // ── Guard: Validate phase string at boot time ────────────────────
  if (!phaseString || typeof phaseString !== "string") {
    logMiddlewareError(
      "CheckPhaseFrozen",
      `Middleware misconfiguration: phaseString must be a non-empty string. Received: ${phaseString}`,
      {}
    );
    throw new Error(
      `CheckPhaseFrozen middleware misconfiguration: phaseString must be a non-empty string.`
    );
  }

  return (req, res, next) => {
    try {
      // ── Check if phase data is attached to request ───────────────────
      const phase = req[phaseString];

      if (!phase) {
        logMiddlewareError(
          "CheckPhaseFrozen",
          `req.${phaseString} is missing – fetch middleware may not have run.`,
          req
        );
        return throwInternalServerError(
          res,
          `${phaseString} data not found. Fetch middleware may not have run.`
        );
      }

      // ── Check if phase is frozen ──────────────────────────────────────
      if (phase.isFrozen === true) {
        logWithTime(
          `⚠️ [CheckPhaseFrozen] ${phaseString} phase is frozen (ID: ${phase._id}). Access denied.`
        );
        return throwAccessDeniedError(
          res,
          `${phaseString.charAt(0).toUpperCase() + phaseString.slice(1)} phase is frozen and cannot be modified.`
        );
      }

      // ── Continue to next middleware ──────────────────────────────────
      logWithTime(`✅ [CheckPhaseFrozen] ${phaseString} phase is active (not frozen). Proceeding...`);
      return next();

    } catch (error) {
      logMiddlewareError(
        "CheckPhaseFrozen",
        `Unexpected error: ${error.message}`,
        req
      );
      return throwInternalServerError(res, "An unexpected error occurred during phase check.");
    }
  };
};

module.exports = { createCheckPhaseFrozenMiddleware };
