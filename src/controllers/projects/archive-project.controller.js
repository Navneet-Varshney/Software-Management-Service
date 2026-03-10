// controllers/projects/archive-project.controller.js

const { archiveProjectService } = require("@services/projects/archive-project.service");
const { sendProjectArchivedSuccess } = require("@/responses/success/project.response");
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
 * Controller: Archive Project
 *
 * @route  PATCH /software-management-service/api/v1/admin/archive-project/:projectId
 * @access Private – Admin (CEO / Manager)
 *
 * @params {string} projectId - MongoDB ObjectId of the project
 *
 * No request body required.
 * Only COMPLETED projects can be archived.
 * Blocked if: project is deleted, already archived, or status !== COMPLETED.
 *
 * @returns {200} Project archived successfully
 * @returns {400} Bad request / invalid state
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */
const archiveProjectController = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) return throwMissingFieldsError(res, ["projectId"]);
    if (!isValidMongoID(projectId)) {
      return throwBadRequestError(res, "Invalid projectId format", "projectId must be a valid ObjectId string.");
    }

    const archivedBy = req.admin.adminId;

    const result = await archiveProjectService(projectId, {
      archivedBy,
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
        result.message === "Project is already archived" ||
        result.message === "Only a COMPLETED project can be archived"
      ) {
        return throwBadRequestError(res, result.message, result.currentStatus
          ? `Current project status is: ${result.currentStatus}`
          : result.message
        );
      }
      if (result.message === "Validation error") {
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logMiddlewareError("archiveProject", result.message, req);
      return throwSpecificInternalServerError(res, result.message);
    }

    return sendProjectArchivedSuccess(res, result.project);
  } catch (error) {
    logMiddlewareError("archiveProject", `Unexpected error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { archiveProjectController };
