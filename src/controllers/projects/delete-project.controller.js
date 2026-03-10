// controllers/projects/delete-project.controller.js

const { deleteProjectService } = require("@services/projects/delete-project.service");
const { sendProjectDeletedSuccess } = require("@/responses/success/project.response");
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
 * Controller: Delete Project (Soft Delete)
 *
 * @route  DELETE /software-management-service/api/v1/admin/delete-project/:projectId
 * @access Private – Admin (CEO only)
 *
 * @params {string} projectId               - MongoDB ObjectId of the project
 * @body   {string} deletionReasonType      - Enum: why the project is being deleted
 * @body   {string} [deletionReasonDescription] - Optional free-text elaboration
 *
 * DELETE IS PERMANENT (one-way soft delete):
 *   – Can only be done once (blocked if isDeleted === true)
 *   – Blocked if projectStatus === COMPLETED
 *   – After deletion: update / abort / complete / resume are all blocked
 *
 * @returns {200} Project deleted successfully (no body data returned)
 * @returns {400} Bad request / invalid state
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */
const deleteProjectController = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) return throwMissingFieldsError(res, ["projectId"]);
    if (!isValidMongoID(projectId)) {
      return throwBadRequestError(res, "Invalid projectId format", "projectId must be a valid ObjectId string.");
    }

    const { deletionReasonType, deletionReasonDescription } = req.body;
    const deletedBy = req.admin.adminId;

    const result = await deleteProjectService(projectId, {
      deletionReasonType,
      deletionReasonDescription,
      deletedBy,
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
        result.message === "Project is already deleted" ||
        result.message === "Project is already completed"
      ) {
        return throwBadRequestError(res, result.message, result.message);
      }
      if (result.message === "Validation error") {
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logMiddlewareError("deleteProject", result.message, req);
      return throwSpecificInternalServerError(res, result.message);
    }

    return sendProjectDeletedSuccess(res);
  } catch (error) {
    logMiddlewareError("deleteProject", `Unexpected error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { deleteProjectController };
