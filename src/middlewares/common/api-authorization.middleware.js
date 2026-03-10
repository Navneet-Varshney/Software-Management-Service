const {
  createAdminRoleAuthMiddleware,
  createClientRoleAuthMiddleware,
} = require("@middlewares/factory/role-authorization.middleware-factory");

const { ApiRolePermissions } = require("@configs/api-role-permissions.config");

// ─────────────────────────────────────────────────────────────────────────────
// Admin role-authorization middlewares
// ─────────────────────────────────────────────────────────────────────────────

/** Allows only CEO and Business Analyst admins to create a project. */
const authorizeAdminCreateProject = createAdminRoleAuthMiddleware(
  ApiRolePermissions.admin.createProject
);

/** Allows CEO, Business Analyst, and Manager admins to update a project. */
const authorizeAdminUpdateProject = createAdminRoleAuthMiddleware(
  ApiRolePermissions.admin.updateProject
);


const apiAuthorizationMiddleware = {
  authorizeAdminCreateProject,
  authorizeAdminUpdateProject
}

module.exports = {
    apiAuthorizationMiddleware
};
