// controllers/stakeholders/create-stakeholder.controller.js

const { createStakeholderService } = require("@services/stakeholders/create-stakeholder.service");
const { sendStakeholderCreatedSuccess } = require("@/responses/success/stakeholder.response");
const {
  throwBadRequestError,
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * Controller: Create Stakeholder
 *
 * @route  POST /software-management-service/api/v1/admin/create-stakeholder
 * @access Private – Admin (CEO / Business Analyst / Manager)
 *
 * @body {string} projectId  - MongoDB ObjectId of the target project
 * @body {string} userId     - USR-prefixed custom ID of the user to add as stakeholder
 * @body {string} role       - Role to assign (admin ProjectRole OR client ClientRole)
 *
 * Role-guard middleware has already verified the userId and confirmed that the role
 * matches the user's entity type (admin vs client). req.stakeholderUser is populated.
 *
 * @returns {201} Stakeholder created
 * @returns {400} Missing / invalid fields
 * @returns {409} Stakeholder already exists for this project
 * @returns {500} Internal server error
 */
const createStakeholderController = async (req, res) => {
  try {
    const { projectId, userId, role } = req.body;
    const createdBy  = req.admin.adminId;

    // Derive organizationId: only meaningful for client-type users
    const organizationId =
      req.stakeholderUser?.entityType === "client"
        ? req.stakeholderUser.entity?.organizationId ?? null
        : null;

    const result = await createStakeholderService({
      projectId,
      userId,
      role,
      organizationId,
      createdBy,
      auditContext: {
        admin:     req.admin,
        device:    req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "Stakeholder already exists for this project") {
        logWithTime(`❌ [createStakeholderController] Stakeholder already exists for this project | ${getLogIdentifiers(req)}`);
        return throwConflictError(res, result.message, "A stakeholder with this user ID already exists for the given project.");
      }
      if (result.message === "Project not found") {
        logWithTime(`❌ [createStakeholderController] Project not found | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Project");
      }
      if (result.message === "Invalid projectId format") {
        logWithTime(`❌ [createStakeholderController] Invalid projectId format | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Invalid projectId format", "projectId must be a valid MongoDB ObjectId.");
      }
      if (result.message?.startsWith("Cannot add a stakeholder to a")) {
        logWithTime(`❌ [createStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message);
      }
      if (result.message === "Validation error") {
        logWithTime(`❌ [createStakeholderController] Validation error: ${JSON.stringify(result.error)} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logWithTime(`❌ [createStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [createStakeholderController] Stakeholder created successfully | ${getLogIdentifiers(req)}`);
    return sendStakeholderCreatedSuccess(res, result.stakeholder);
  } catch (error) {
    logWithTime(`❌ [createStakeholderController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { createStakeholderController };
