const { StakeholderModel } = require("@models/stakeholder.model");
const { logMiddlewareError } = require("@utils/log-error.util");
const {
    throwAccessDeniedError,
    throwInternalServerError,
    throwMissingFieldsError,
    throwValidationError,
    throwBadRequestError,
    throwDBResourceNotFoundError
} = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");
const { isValidMongoID } = require("@/utils/id-validators.util");

const fetchStakeholderMiddleware = async (req, res, next) => {
    try {
        const { stakeholderId } = req.params;

        if (!stakeholderId) {
            logMiddlewareError("fetchStakeholder", "Missing stakeholderId in request parameters", req);
            return throwMissingFieldsError(res, "Stakeholder ID is required.");
        }

        if (!isValidMongoID(stakeholderId)) {
            logMiddlewareError("fetchStakeholder", "Invalid stakeholderId format", req);
            return throwValidationError(res, ["Invalid stakeholderId format. Must be a valid MongoDB ID string."]);
        }

        const stakeholder = await StakeholderModel.findOne({
            _id: stakeholderId,
            isDeleted: false
        });

        if (!stakeholder) {
            logMiddlewareError("fetchStakeholder", `Stakeholder ${stakeholderId} not found for any Project`, req);
            return throwDBResourceNotFoundError(res, `Stakeholder with Id ${stakeholderId}`);
        }

        req.foundStakeholder = stakeholder; // Attach stakeholder info to request for downstream use

        logWithTime(`✅ User ${stakeholder.userId} is a stakeholder of project: ${stakeholder.projectId} with role ${stakeholder.role}`);
        return next();
    } catch (err) {
        logMiddlewareError("fetchStakeholder", `Unexpected error: ${err.message}`, req);
        return throwInternalServerError(res, err);
    }
}

module.exports = {
    fetchStakeholderMiddleware
}