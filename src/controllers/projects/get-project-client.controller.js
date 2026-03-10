// controllers/projects/get-project-client.controller.js

const { getProjectClientService } = require("@services/projects/get-project.service");
const { sendProjectFetchedSuccess } = require("@/responses/success/project.response");
const {
  throwMissingFieldsError,
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
} = require("@/responses/common/error-handler.response");
const { isValidMongoID } = require("@/utils/id-validators.util");

/**
 * Controller: Get Single Project – Client View
 *
 * @route  GET /software-management-service/api/v1/admin/get-project-client/:projectId
 * @access Private – All admin roles (serves client-facing data)
 *
 * Returns only the publicly safe fields:
 *   _id, name, description, problemStatement, goal, version,
 *   projectStatus, currentPhase, createdAt, updatedAt, completedAt
 *
 * Deleted projects are treated as not found.
 *
 * @returns {200} Project details (restricted fields)
 * @returns {400} Invalid projectId
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */
const getProjectClientController = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) return throwMissingFieldsError(res, ["projectId"]);
    if (!isValidMongoID(projectId)) {
      return throwBadRequestError(res, "Invalid projectId format", "projectId must be a valid ObjectId string.");
    }

    const result = await getProjectClientService(projectId);

    if (!result.success) {
      if (result.message === "Project not found") {
        return throwDBResourceNotFoundError(res, "Project");
      }
      return throwInternalServerError(res, result.message);
    }

    return sendProjectFetchedSuccess(res, result.project);
  } catch (error) {
    return throwInternalServerError(res, error.message);
  }
};

module.exports = { getProjectClientController };
