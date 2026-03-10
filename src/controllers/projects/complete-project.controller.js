// controllers/projects/complete-project.controller.js

const { completeProjectService } = require("@services/projects/complete-project.service");
const { sendProjectCompletedSuccess } = require("@/responses/success/project.response");
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
 * Controller: Complete Project
 *
 * @route  PATCH /software-management-service/api/v1/admin/complete-project/:projectId
 * @access Private – Admin (CEO / Manager)
 *
 * @params {string} projectId - MongoDB ObjectId of the project
 *
 * No request body required. projectId in params is the only input.
 * After completion NO further operations are permitted on the project.
 *
 * Blocked if: project is deleted, or already COMPLETED.
 * Allowed from status: ACTIVE only.
 *
 * @returns {200} Project completed successfully
 * @returns {400} Bad request / invalid state
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */
const completeProjectController = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) return throwMissingFieldsError(res, ["projectId"]);
    if (!isValidMongoID(projectId)) {
      return throwBadRequestError(res, "Invalid projectId format", "projectId must be a valid ObjectId string.");
    }

    const completedBy = req.admin.adminId;

    const result = await completeProjectService(projectId, {
      completedBy,
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
        result.message === "Only an ACTIVE project can be completed"
      ) {
        return throwBadRequestError(res, result.message, result.currentStatus
          ? `Current project status is: ${result.currentStatus}`
          : result.message
        );
      }
      if (result.message === "Validation error") {
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logMiddlewareError("completeProject", result.message, req);
      return throwSpecificInternalServerError(res, result.message);
    }

    return sendProjectCompletedSuccess(res, result.project);
  } catch (error) {
    logMiddlewareError("completeProject", `Unexpected error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { completeProjectController };
