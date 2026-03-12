const { StakeholderModel } = require("@models/stakeholder.model");
const { ProjectCategoryTypes } = require("@configs/enums.config");
const { logMiddlewareError } = require("@utils/log-error.util");
const { throwAccessDeniedError, throwInternalServerError } = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const checkUserIsStakeholder = async (req, res, next) => {
    try {
        const userId  = req?.admin?.adminId || req?.client?.clientId;
        const project = req.project;

        const stakeholder = await StakeholderModel.find({
            stakeholderId: userId,
            projectId:     project._id,
            isDeleted:     false
        });

        if (!stakeholder) {
            logMiddlewareError("checkUserIsStakeholder", `User ${userId} is not a stakeholder of project ${project._id}`, req);
            return throwAccessDeniedError(res, "You do not have permission to perform this action on the specified project.");
        }

        // For org-based projects verify the stakeholder's org is associated with the project
        if (
            project.projectCategory === ProjectCategoryTypes.ORGANIZATION ||
            project.projectCategory === ProjectCategoryTypes.MULTI_ORGANIZATION
        ) {
            const stakeholderOrgId = stakeholder.organizationId?.toString();
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