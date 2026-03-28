// middlewares/factory/check-user-role.middleware-factory.js

const {
  throwAccessDeniedError,
  logMiddlewareError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Factory function to create role-checking middleware.
 * 
 * IMPORTANT: Must be used AFTER checkUserIsStakeholder.middleware
 * 
 * Validates that the authenticated user's stakeholder role is in the allowed roles.
 *
 * @param {string[]} allowedRoles - Array of allowed ProjectRoleTypes
 * @returns {Function} Express middleware
 *
 * Usage:
 *   checkUserRoleFactory([ProjectRoleTypes.OWNER, ProjectRoleTypes.LEAD])
 */
const checkUserRoleFactory = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // ── Guard: stakeholder must be present (set by checkUserIsStakeholder) ────
      if (!req.stakeholder) {
        logMiddlewareError("checkUserRoleFactory", "Stakeholder not found in request", req);
        return throwAccessDeniedError(res, "Stakeholder context not found. You must be a project stakeholder.");
      }

      // ── Guard: role must be in allowed roles ─────────────────────────────────
      const userRole = req.stakeholder.role;
      if (!allowedRoles.includes(userRole)) {
        logWithTime(
          `⛔️ [checkUserRoleFactory] User ${req.stakeholder.userId} with role '${userRole}' not in allowed roles [${allowedRoles.join(", ")}] | ${getLogIdentifiers(req)}`
        );
        return throwAccessDeniedError(
          res,
          `Your role '${userRole}' does not have permission for this action. Allowed roles: ${allowedRoles.join(", ")}`
        );
      }

      logWithTime(
        `✅ [checkUserRoleFactory] User ${req.stakeholder.userId} with role '${userRole}' authorized | ${getLogIdentifiers(req)}`
      );
      return next();

    } catch (error) {
      logMiddlewareError("checkUserRoleFactory", `Unexpected error: ${error.message}`, req);
      return throwAccessDeniedError(res, "Authorization check failed");
    }
  };
};

module.exports = { checkUserRoleFactory };
