// middlewares/factory/role-authorization.middleware-factory.js

const { hasRequiredRole } = require("@utils/has-required-role.util");
const {
  throwAccessDeniedError,
  throwUnauthorizedError,
  logMiddlewareError,
  throwInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { checkUserIsStakeholder } = require("../stakeholders/check-user-is-stakeholder.middleware");

// Admin Authorization Role Middlewares

const createAdminRoleAuthMiddleware = (allowedRoles) => {
  // Guard: catch misconfigured calls at boot time rather than at request time.

  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    logMiddlewareError(
      "AdminRoleAuth",
      "Middleware misconfiguration: allowedRoles must be a non-empty array.",
      {}
    );

    throw new Error(
      "AdminRoleAuth middleware misconfiguration: allowedRoles must be a non-empty array."
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

    logWithTime(`✅ Admin '${admin.adminId}' with role '${admin.role}' passed role check.`);
    return next();
  };
};

// Client Authorization Role Middlewares

const createClientRoleAuthMiddleware = (allowedRoles) => {
  // Guard: catch misconfigured calls at boot time rather than at request time.
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    logMiddlewareError(
      "ClientRoleAuth",
      "Middleware misconfiguration: allowedRoles must be a non-empty array.",
      {}
    );
    throw new Error(
      "ClientRoleAuth middleware misconfiguration: allowedRoles must be a non-empty array."
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

    logWithTime(`✅ Client '${client.clientId}' passed role check. Access granted.`);
    return next();
  };
};

const createAdminRoleOrStakeholderAuthMiddleware = (allowedRoles) => {

  return async (req, res, next) => {
    try {

      const user = req?.admin || req?.client;
      const project = req.project;

      if (req.admin) {
        if (hasRequiredRole(user, allowedRoles)) {
          req.authorizationContext = {
            grantedBy: "admin-role",
            requesterType: "admin",
          };
          logWithTime(`✅ Admin '${user.adminId}' authorized via role`);
          return next();
        } else {
          logWithTime(`🔎 Checking Admin is Stakeholder of project with id ${project._id} or not`);
          return checkUserIsStakeholder(req, res, next);
        }

      }

      // fallback to stakeholder
      return checkUserIsStakeholder(req, res, next);

    } catch (err) {
      logMiddlewareError(
        "AdminOrStakeholderAuth",
        `Unexpected error: ${err.message}`,
        req
      );
      return throwInternalServerError(res, err);
    }
  };
};

module.exports = {
  createAdminRoleAuthMiddleware,
  createClientRoleAuthMiddleware,
  createAdminRoleOrStakeholderAuthMiddleware
};
