// controllers/projects/abort-project.controller.js

const { abortProjectService } = require("@services/projects/abort-project.service");
const { sendProjectAbortedSuccess } = require("@/responses/success/project.response");
const {
  throwMissingFieldsError,
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  logMiddlewareError,
  throwSpecificInternalServerError,
} = require("@/responses/common/error-handler.response");
const { isValidMongoID } = require("@/utils/id-validators.util");

/**
 * Controller: Abort Project
 *
 * @route  PATCH /software-management-service/api/v1/admin/abort-project/:projectId
 * @access Private – Admin (CEO / Manager)
 *
 * @params {string} projectId            - MongoDB ObjectId of the project
 * @body   {string} abortReasonType      - Enum: why the project is being aborted
 * @body   {string} [abortReasonDescription] - Optional free-text elaboration
 *
 * Blocked if: project is deleted, already COMPLETED, or already ABORTED.
 * Allowed from statuses: DRAFT | ACTIVE | ON_HOLD
 *
 * @returns {200} Project aborted successfully
 * @returns {400} Bad request / invalid state
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */
const abortProjectController = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) return throwMissingFieldsError(res, ["projectId"]);
    if (!isValidMongoID(projectId)) {
      return throwBadRequestError(res, "Invalid projectId format", "projectId must be a valid ObjectId string.");
    }

    const { abortReasonType, abortReasonDescription } = req.body;
    const abortedBy = req.admin.adminId;

    const result = await abortProjectService(projectId, {
      abortReasonType,
      abortReasonDescription,
      abortedBy,
      auditContext: {
        admin: req.admin,
        device: req.device,
        requestId: req.requestId,
      },
    });

    if (!result.success) {
      if (result.message === "Project not found") {
        return throwDBResourceNotFoundError(res, "Project");
      }
      if (
        result.message === "Project is deleted" ||
        result.message === "Project is already completed" ||
        result.message === "Project is already aborted"
      ) {
        return throwBadRequestError(res, result.message, result.message);
      }
      if (result.message === "Validation error") {
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logMiddlewareError("abortProject", result.message, req);
      return throwSpecificInternalServerError(res, result.message);
    }

    return sendProjectAbortedSuccess(res, result.project);
  } catch (error) {
    logMiddlewareError("abortProject", `Unexpected error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { abortProjectController };
