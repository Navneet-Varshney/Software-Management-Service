const {
  createAdminRoleAuthMiddleware,
  createClientRoleAuthMiddleware,
} = require("@middlewares/factory/role-authorization.middleware-factory");

const { ApiRolePermissions } = require("@configs/api-role-permissions.config");

// ─────────────────────────────────────────────────────────────────────────────
// Admin role-authorization middlewares
// ─────────────────────────────────────────────────────────────────────────────

const authorizeAdminCreateProject  = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.createProject);
const authorizeAdminUpdateProject   = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.updateProject);
const authorizeAdminAbortProject    = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.abortProject);
const authorizeAdminCompleteProject = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.completeProject);
const authorizeAdminResumeProject   = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.resumeProject);
const authorizeAdminDeleteProject   = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.deleteProject);
const authorizeAdminArchiveProject  = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.archiveProject);
const authorizeAdminGetProject      = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.getProject);
const authorizeAdminGetProjects     = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.getProjects);


const apiAuthorizationMiddleware = {
  authorizeAdminCreateProject,
  authorizeAdminUpdateProject,
  authorizeAdminAbortProject,
  authorizeAdminCompleteProject,
  authorizeAdminResumeProject,
  authorizeAdminDeleteProject,
  authorizeAdminArchiveProject,
  authorizeAdminGetProject,
  authorizeAdminGetProjects,
}

module.exports = {
    apiAuthorizationMiddleware
};
