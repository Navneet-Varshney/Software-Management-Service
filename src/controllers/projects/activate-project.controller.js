// controllers/projects/activate-project.controller.js

const { activateProjectService } = require("@services/projects/activate-project.service");
const { sendProjectActivateSuccess } = require("@/responses/success/project.response");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Activate Project
 *
 * @route  PATCH /software-management-service/api/v1/admin/activate-project/:projectId
 * @access Private – Admin (CEO / Manager)
 *
 * @params {string} projectId              - MongoDB ObjectId of the project
 * @body   {string} activationReasonType       - Enum: why the project is being activated
 * @body   {string} [activationReasonDescription] - Optional free-text elaboration
 *
 * Blocked if: project is deleted, or projectStatus === COMPLETED.
 * Allowed from statuses: DRAFT
 *
 * @returns {200} Project activated successfully
 * @returns {400} Bad request / invalid state
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */
const activateProjectController = async (req, res) => {
  try {
    const project = req.project; // fetchProjectMiddleware ne inject kiya hai

    const { activationReasonType, activationReasonDescription } = req.body;
    const activatedBy = req.admin.adminId;

    const result = await activateProjectService(project, {
      activationReasonType,
      activationReasonDescription,
      activatedBy,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (
        result.message === "Only a DRAFT project can be activated"
      ) {
        logWithTime(`❌ [activateProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, result.message, result.currentStatus
          ? `Current project status is: ${result.currentStatus}`
          : result.message
        );
      }
      if (result.message === "Validation error") {
        logWithTime(`❌ [activateProjectController] Validation error: ${JSON.stringify(result.error)} | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logWithTime(`❌ [activateProjectController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [activateProjectController] Project activated successfully | ${getLogIdentifiers(req)}`);
    return sendProjectActivateSuccess(res, result.project);
  } catch (error) {
    logWithTime(`❌ [activateProjectController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { activateProjectController };
