// middlewares/factory/role-authorization.middleware-factory.js

const { hasRequiredRole } = require("@utils/has-required-role.util");
const {
  throwAccessDeniedError,
  throwUnauthorizedError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");

// Admin Authorization Role Middlewares

const createAdminRoleAuthMiddleware = (allowedRoles) => {
  // Guard: catch misconfigured calls at boot time rather than at request time.
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    throw new Error(
      "createAdminRoleAuthMiddleware: allowedRoles must be a non-empty array of AdminRoleTypes values."
    );
  }

  return (req, res, next) => {
    const admin = req.admin;

    if (!admin) {
      logMiddlewareError(
        "AdminRoleAuth",
        "req.admin is missing – authentication middleware may not have run.",
        req
      );
      return throwUnauthorizedError(res, "Admin", "Authentication required before role check.");
    }

    if (!hasRequiredRole(admin, allowedRoles)) {
      logMiddlewareError(
        "AdminRoleAuth",
        `Admin role '${admin.role}' is not permitted. Required one of: [${allowedRoles.join(", ")}]`,
        req
      );
      return throwAccessDeniedError(res, "You do not have the required role to perform this action.");
    }

    return next();
  };
};

// Client Authorization Role Middlewares

const createClientRoleAuthMiddleware = (allowedRoles) => {
  // Guard: catch misconfigured calls at boot time rather than at request time.
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    throw new Error(
      "createClientRoleAuthMiddleware: allowedRoles must be a non-empty array of ClientRoleTypes values."
    );
  }

  return (req, res, next) => {
    const client = req.client;

    if (!client) {
      logMiddlewareError(
        "ClientRoleAuth",
        "req.client is missing – authentication middleware may not have run.",
        req
      );
      return throwUnauthorizedError(res, "Client", "Authentication required before role check.");
    }

    if (!hasRequiredRole(client, allowedRoles)) {
      logMiddlewareError(
        "ClientRoleAuth",
        `Client role '${client.role}' is not permitted. Required one of: [${allowedRoles.join(", ")}]`,
        req
      );
      return throwAccessDeniedError(res, "You do not have the required role to perform this action.");
    }

    return next();
  };
};

module.exports = {
  createAdminRoleAuthMiddleware,
  createClientRoleAuthMiddleware,
};
