const {
  createAdminRoleAuthMiddleware
} = require("@middlewares/factory/role-authorization.middleware-factory");

const { ApiRolePermissions } = require("@configs/api-role-permissions.config");

// ─────────────────────────────────────────────────────────────────────────────
// Admin role-authorization middlewares
// ─────────────────────────────────────────────────────────────────────────────

const authorizeAdminCreateProject  = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.createProject);
const authorizeAdminUpdateProject   = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.updateProject);
const authorizeAdminOnHoldProject   = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.onHoldProject);
const authorizeAdminAbortProject    = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.abortProject);
const authorizeAdminCompleteProject = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.completeProject);
const authorizeAdminResumeProject   = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.resumeProject);
const authorizeAdminDeleteProject   = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.deleteProject);
const authorizeAdminArchiveProject  = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.archiveProject);
const authorizeAdminGetProject      = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.getProject);
const authorizeAdminGetProjects     = createAdminRoleAuthMiddleware(ApiRolePermissions.admin.getProjects);

// ─────────────────────────────────────────────────────────────────────────────
// Stakeholder role-authorization middlewares
// ─────────────────────────────────────────────────────────────────────────────
const authorizeAdminCreateStakeholder = createAdminRoleAuthMiddleware(ApiRolePermissions.stakeholder.createStakeholder);
const authorizeAdminUpdateStakeholder = createAdminRoleAuthMiddleware(ApiRolePermissions.stakeholder.updateStakeholder);
const authorizeAdminDeleteStakeholder = createAdminRoleAuthMiddleware(ApiRolePermissions.stakeholder.deleteStakeholder);
const authorizeAdminGetStakeholder    = createAdminRoleAuthMiddleware(ApiRolePermissions.stakeholder.getStakeholder);
const authorizeAdminGetStakeholders   = createAdminRoleAuthMiddleware(ApiRolePermissions.stakeholder.getStakeholders);

const adminApiAuthorizationMiddleware = {
  authorizeAdminCreateProject,
  authorizeAdminUpdateProject,
  authorizeAdminOnHoldProject,
  authorizeAdminAbortProject,
  authorizeAdminCompleteProject,
  authorizeAdminResumeProject,
  authorizeAdminDeleteProject,
  authorizeAdminArchiveProject,
  authorizeAdminGetProject,
  authorizeAdminGetProjects,
  authorizeAdminCreateStakeholder,
  authorizeAdminUpdateStakeholder,
  authorizeAdminDeleteStakeholder,
  authorizeAdminGetStakeholder,
  authorizeAdminGetStakeholders,
}

module.exports = {
    adminApiAuthorizationMiddleware
};
