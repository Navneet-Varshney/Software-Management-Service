const { StakeholderModel } = require("@models/stakeholder.model");
const { ProjectCategoryTypes } = require("@configs/enums.config");
const { logMiddlewareError } = require("@utils/log-error.util");
const { throwAccessDeniedError, throwInternalServerError } = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { checkUserRoleType } = require("@/utils/role-check.util");

const checkUserIsStakeholder = async (req, res, next) => {
    try {
        const userId = req?.admin?.adminId || req?.client?.clientId;
        const project = req.project;

        const stakeholder = await StakeholderModel.findOne({
            userId: userId,
            projectId: project._id,
            isDeleted: false
        });

        if (!stakeholder) {
            logMiddlewareError("checkUserIsStakeholder", `User ${userId} is not a stakeholder of project ${project._id}`, req);
            return throwAccessDeniedError(res, "You do not have permission to perform this action on the specified project.");
        }

        const { isAdmin, isClient } = checkUserRoleType(stakeholder.role);

        if (project.projectCategory === ProjectCategoryTypes.INDIVIDUAL) {
        } else {
            if (isClient) {
                const stakeholderOrgId = stakeholder.organizationId;
                // For org-based projects verify the stakeholder's org is associated with the project
                if (project.projectCategory === ProjectCategoryTypes.ORGANIZATION) {
                    const projectOrgId = project.orgIds[0];
                    if (stakeholderOrgId != projectOrgId) {
                        logMiddlewareError(
                            "checkUserIsStakeholder",
                            `User ${userId} org ${stakeholderOrgId} does not match project org ${projectOrgId} for project ${project._id}`,
                            req
                        );
                        return throwAccessDeniedError(res, "Your organisation is not associated with this project.");
                    }
                }
                if (
                    project.projectCategory === ProjectCategoryTypes.MULTI_ORGANIZATION
                ) {
                    const orgMatches = Array.isArray(project.orgIds) &&
                        project.orgIds.some(id => id.toString() === stakeholderOrgId);

                    if (!orgMatches) {
                        logMiddlewareError(
                            "checkUserIsStakeholder",
                            `User ${userId} org ${stakeholderOrgId} is not in project org list for project ${project._id}`,
                            req
                        );
                        return throwAccessDeniedError(res, "Your organisation is not associated with this project.");
                    }
                }
            }
        }

        req.stakeholder = stakeholder; // Attach stakeholder info to request for downstream use
        req.authorizationContext = {
            grantedBy: "stakeholder-membership",
            requesterType: req.admin ? "admin" : "client",
            stakeholderRoleType: isAdmin ? "admin" : isClient ? "client" : "unknown",
        };

        logWithTime(`✅ User ${userId} is a stakeholder of project ${project._id}`);
        return next();
    } catch (err) {
        logMiddlewareError("checkUserIsStakeholder", `Unexpected error: ${err.message}`, req);
        return throwInternalServerError(res, err);
    }
}

module.exports = {
    checkUserIsStakeholder
}