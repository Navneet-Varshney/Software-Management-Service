// controllers/projects/resume-project.controller.js

const { resumeProjectService } = require("@services/projects/resume-project.service");
const { sendProjectResumedSuccess } = require("@/responses/success/project.response");
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
 * Controller: Resume Project
 *
 * @route  PATCH /software-management-service/api/v1/admin/resume-project/:projectId
 * @access Private – Admin (CEO / Manager)
 *
 * @params {string} projectId              - MongoDB ObjectId of the project
 * @body   {string} resumeReasonType       - Enum: why the project is being resumed
 * @body   {string} [resumeReasonDescription] - Optional free-text elaboration
 *
 * Blocked if: project is deleted, or projectStatus === COMPLETED.
 * Allowed from statuses: ON_HOLD | ABORTED
 *
 * @returns {200} Project resumed successfully
 * @returns {400} Bad request / invalid state
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */
const resumeProjectController = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) return throwMissingFieldsError(res, ["projectId"]);
    if (!isValidMongoID(projectId)) {
      return throwBadRequestError(res, "Invalid projectId format", "projectId must be a valid ObjectId string.");
    }

    const { resumeReasonType, resumeReasonDescription } = req.body;
    const resumedBy = req.admin.adminId;

    const result = await resumeProjectService(projectId, {
      resumeReasonType,
      resumeReasonDescription,
      resumedBy,
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
        result.message === "Only an ON_HOLD or ABORTED project can be resumed"
      ) {
        return throwBadRequestError(res, result.message, result.currentStatus
          ? `Current project status is: ${result.currentStatus}`
          : result.message
        );
      }
      if (result.message === "Validation error") {
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logMiddlewareError("resumeProject", result.message, req);
      return throwSpecificInternalServerError(res, result.message);
    }

    return sendProjectResumedSuccess(res, result.project);
  } catch (error) {
    logMiddlewareError("resumeProject", `Unexpected error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { resumeProjectController };
