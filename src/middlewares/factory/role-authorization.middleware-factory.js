// middlewares/factory/role-authorization.middleware-factory.js

const { hasRequiredRole } = require("@utils/has-required-role.util");
const { StakeholderModel } = require("@models/stakeholder.model");
const {
  throwAccessDeniedError,
  throwUnauthorizedError,
  throwInternalServerError,
  logMiddlewareError,
  throwSpecificInternalServerError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

// Admin Authorization Role Middlewares

const createAdminRoleAuthMiddleware = (allowedRoles) => {
  // Guard: catch misconfigured calls at boot time rather than at request time.
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    logMiddlewareError(
      "AdminRoleAuth",
      "Middleware misconfiguration: allowedRoles must be a non-empty array.",
      {}
    );
    return throwSpecificInternalServerError(
      "AdminRoleAuth",
      "Middleware misconfiguration: allowedRoles must be a non-empty array."
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

    logWithTime(`✅ Admin '${admin.adminId}' passed role check. Access granted.`);
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
    return throwSpecificInternalServerError(
      "ClientRoleAuth",
      "Middleware misconfiguration: allowedRoles must be a non-empty array."
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

// ─────────────────────────────────────────────────────────────────────────────
// Combined: Admin Role  OR  Stakeholder access
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Factory that produces a middleware granting access via TWO independent paths:
 *
 *  Path 1 – Role check:
 *    admin.role is in allowedRoles  →  allow
 *
 *  Path 2 – Stakeholder check:
 *    If req.project is available (fetchProjectMiddleware ran):
 *      admin.adminId exists as an active stakeholder of that specific project → allow
 *    Otherwise (list routes with no single projectId):
 *      admin.adminId exists as an active stakeholder of ANY project → allow
 *
 *  If neither path passes → 403 Access Denied.
 *
 * @param {string[]} allowedRoles - AdminRoleTypes values
 */
const createAdminRoleOrStakeholderAuthMiddleware = (allowedRoles) => {
  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    logMiddlewareError(
      "AdminRoleOrStakeholderAuth",
      "Middleware misconfiguration: allowedRoles must be a non-empty array.",
      {}
    );
    return throwSpecificInternalServerError(
      "AdminRoleOrStakeholderAuth",
      "Middleware misconfiguration: allowedRoles must be a non-empty array."
    );
  }

  return async (req, res, next) => {
    try {
      const admin = req.admin;

      if (!admin) {
        logMiddlewareError(
          "AdminRoleOrStakeholderAuth",
          "req.admin is missing – authentication middleware may not have run.",
          req
        );
        return throwUnauthorizedError(res, "Admin", "Authentication required before access check.");
      }

      // ── Path 1: role-based ────────────────────────────────────────────────
      if (hasRequiredRole(admin, allowedRoles)) {
        return next();
      }

      // ── Path 2: stakeholder-based ─────────────────────────────────────────
      const stakeholderQuery = {
        stakeholderId: admin.adminId,
        isDeleted: false,
      };

      // If a specific project was already fetched, scope the check to it
      if (req.project?._id) {
        stakeholderQuery.projectId = req.project._id;
      }

      const isStakeholder = await StakeholderModel.exists(stakeholderQuery);

      if (isStakeholder) {
        logWithTime(`✅ Admin '${admin.adminId}' passed stakeholder check for project '${stakeholderQuery.projectId || "ANY"}'. Access granted.`);
        return next();
      }

      logMiddlewareError(
        "AdminRoleOrStakeholderAuth",
        `Admin '${admin.adminId}' role '${admin.role}' not permitted and is not a stakeholder.`,
        req
      );
      return throwAccessDeniedError(
        res,
        "You do not have the required role or stakeholder membership to access this resource."
      );
    } catch (err) {
      logMiddlewareError("AdminRoleOrStakeholderAuth", `Unexpected error: ${err.message}`, req);
      return throwInternalServerError(res, err);
    }
  };
};

module.exports = {
  createAdminRoleAuthMiddleware,
  createClientRoleAuthMiddleware,
  createAdminRoleOrStakeholderAuthMiddleware,
};
