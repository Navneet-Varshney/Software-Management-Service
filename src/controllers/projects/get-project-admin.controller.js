// controllers/projects/get-project-admin.controller.js

const { getProjectAdminService } = require("@services/projects/get-project.service");
const { sendProjectFetchedSuccess } = require("@/responses/success/project.response");
const {
  throwMissingFieldsError,
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
} = require("@/responses/common/error-handler.response");
const { isValidMongoID } = require("@/utils/id-validators.util");

/**
 * Controller: Get Single Project – Admin View
 *
 * @route  GET /software-management-service/api/v1/admin/get-project/:projectId
 * @access Private – All admin roles
 *
 * Returns the full project document (all fields), including audit trail,
 * reason fields, archive/deletion flags, etc.
 *
 * @returns {200} Project details
 * @returns {400} Invalid projectId
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */
const getProjectAdminController = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!projectId) return throwMissingFieldsError(res, ["projectId"]);
    if (!isValidMongoID(projectId)) {
      return throwBadRequestError(res, "Invalid projectId format", "projectId must be a valid ObjectId string.");
    }

    const result = await getProjectAdminService(projectId);

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

module.exports = { getProjectAdminController };
