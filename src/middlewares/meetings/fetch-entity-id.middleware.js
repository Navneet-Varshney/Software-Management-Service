const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { InceptionModel } = require("@/models/inception.model");
const { ElicitationModel } = require("@/models/elicitation.model");
const { NegotiationModel } = require("@/models/negotiation.model");
const { SpecificationModel } = require("@/models/specification.model");
const { ElaborationModel } = require("@/models/elaboration.model");
const { ValidationModel } = require("@/models/validation.model");
const { throwBadRequestError, logMiddlewareError, throwDBResourceNotFoundError, throwInternalServerError, throwValidationError } = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const validEntityTypes = {
    [DB_COLLECTIONS.INCEPTIONS]: DB_COLLECTIONS.INCEPTIONS,
    [DB_COLLECTIONS.ELICITATIONS]: DB_COLLECTIONS.ELICITATIONS,
    [DB_COLLECTIONS.NEGOTIATIONS]: DB_COLLECTIONS.NEGOTIATIONS,
    [DB_COLLECTIONS.SPECIFICATIONS]: DB_COLLECTIONS.SPECIFICATIONS,
    [DB_COLLECTIONS.ELABORATIONS]: DB_COLLECTIONS.ELABORATIONS,
    [DB_COLLECTIONS.VALIDATIONS]: DB_COLLECTIONS.VALIDATIONS
}

const fetchEntityIdMiddleware = async (req, res, next) => {
    try {
        const { entityType } = req.params;
        const project = req.project;
        const projectId = project._id;
        
        if (!entityType) {
            logMiddlewareError("fetchEntityId", "entityType parameter is missing", req);
            return throwBadRequestError(res, "entityType parameter is required");
        }

        if (!Object.values(validEntityTypes).includes(entityType)) {
            logMiddlewareError("fetchEntityId", `Invalid entityType: ${entityType}`, req);
            const validValues = Object.values(validEntityTypes).join(", ");
            return throwValidationError(res, [{
                field: "entityType",
                message: `entityType must be one of: ${validValues}`,
                received: entityType
            }]);
        }

        // Fetch Latest phase entity for the project (all 6 phases)
        if (entityType === DB_COLLECTIONS.INCEPTIONS) {
            const latestInception = await InceptionModel.findOne({ projectId: projectId, isDeleted: false }).sort({ "version.major": -1 }).lean();
            if (!latestInception) {
                logMiddlewareError("fetchEntityId", "No inception found for the project", req);
                return throwDBResourceNotFoundError(res, "Inception not found");
            }
            req.parentEntity = latestInception;
            req.inception = latestInception;
            req.projectId = latestInception.projectId;
        } else if (entityType === DB_COLLECTIONS.ELICITATIONS) {
            const latestElicitation = await ElicitationModel.findOne({ projectId: projectId, isDeleted: false }).sort({ "version.major": -1 }).lean();
            if (!latestElicitation) {
                logMiddlewareError("fetchEntityId", "No elicitation found for the project", req);
                return throwDBResourceNotFoundError(res, "Elicitation not found");
            }
            req.parentEntity = latestElicitation;
            req.elicitation = latestElicitation;
            req.projectId = latestElicitation.projectId;
        } else if (entityType === DB_COLLECTIONS.NEGOTIATIONS) {
            const latestNegotiation = await NegotiationModel.findOne({ projectId: projectId, isDeleted: false }).sort({ "version.major": -1 }).lean();
            if (!latestNegotiation) {
                logMiddlewareError("fetchEntityId", "No negotiation found for the project", req);
                return throwDBResourceNotFoundError(res, "Negotiation not found");
            }
            req.parentEntity = latestNegotiation;
            req.negotiation = latestNegotiation;
            req.projectId = latestNegotiation.projectId;
        } else if (entityType === DB_COLLECTIONS.SPECIFICATIONS) {
            const latestSpecification = await SpecificationModel.findOne({ projectId: projectId, isDeleted: false }).sort({ "version.major": -1 }).lean();
            if (!latestSpecification) {
                logMiddlewareError("fetchEntityId", "No specification found for the project", req);
                return throwDBResourceNotFoundError(res, "Specification not found");
            }
            req.parentEntity = latestSpecification;
            req.specification = latestSpecification;
            req.projectId = latestSpecification.projectId;
        } else if (entityType === DB_COLLECTIONS.ELABORATIONS) {
            const latestElaboration = await ElaborationModel.findOne({ projectId: projectId, isDeleted: false }).sort({ "version.major": -1 }).lean();
            if (!latestElaboration) {
                logMiddlewareError("fetchEntityId", "No elaboration found for the project", req);
                return throwDBResourceNotFoundError(res, "Elaboration not found");
            }
            req.parentEntity = latestElaboration;
            req.elaboration = latestElaboration;
            req.projectId = latestElaboration.projectId;
        } else if (entityType === DB_COLLECTIONS.VALIDATIONS) {
            const latestValidation = await ValidationModel.findOne({ projectId: projectId, isDeleted: false }).sort({ "version.major": -1 }).lean();
            if (!latestValidation) {
                logMiddlewareError("fetchEntityId", "No validation found for the project", req);
                return throwDBResourceNotFoundError(res, "Validation not found");
            }
            req.parentEntity = latestValidation;
            req.validation = latestValidation;
            req.projectId = latestValidation.projectId;
        }
        logWithTime(`✅ Entity fetched successfully for type ${entityType} | Entity ID: ${req.parentEntity._id}`);
        return next();
    } catch (error) {
        logMiddlewareError("fetchEntityId", `Error fetching entity ID: ${error.message}`, req);
        return throwInternalServerError(res, "Error fetching entity ID");
    }
}

module.exports = {
    fetchEntityIdMiddleware
}