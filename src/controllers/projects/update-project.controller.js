// controllers/projects/update-project.controller.js

const { updateProjectService } = require("@services/projects/update-project.service");
const { sendProjectUpdatedSuccess } = require("@/responses/success/project.response");
const {
  throwMissingFieldsError,
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  logMiddlewareError,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { isValidMongoID } = require("@/utils/id-validators.util");

/**
 * Controller: Update Project
 *
 * @route  PATCH /software-management-service/api/v1/admin/update-project/:projectId
 * @access Private – Admin (CEO / Business Analyst / Manager)
 *
 * @params {string} projectId                         - MongoDB ObjectId of the project
 * @body   {string} [name]                            - Updated project name
 * @body   {string} [description]                     - Updated description
 * @body   {string} [problemStatement]               - Updated problem statement
 * @body   {string} [goal]                            - Updated goal
 * @body   {string} projectUpdationReasonType         - Enum: why the project is being updated (required)
 * @body   {string} [projectUpdationReasonDescription] - Optional free-text elaboration
 *
 * At least one of name/description/problemStatement/goal must be provided.
 * Blocked if project is soft-deleted or status is COMPLETED.
 *
 * @returns {200} Project updated successfully
 * @returns {400} No updatable fields / no actual changes / project locked
 * @returns {404} Project not found
 * @returns {500} Internal server error
 */

const updateProjectController = async (req, res) => {
  try {
    const { projectId } = req.params;

    // ── Validate route param ──────────────────────────────────────────
    if (!projectId) {
      return throwMissingFieldsError(res, ["projectId"]);
    }

    if (!isValidMongoID(projectId)) {
      return throwBadRequestError(res, "Invalid projectId format", "projectId must be a valid ObjectId string.");
    }

    // ── Ensure at least one updatable field is present ───────────────
    const {
      name, description, problemStatement, goal,
      projectUpdationReasonType,
      projectUpdationReasonDescription,
    } = req.body;

    const hasUpdate = name || description || problemStatement || goal;

    if (!hasUpdate) {
      return throwBadRequestError(
        res,
        "No updatable fields provided",
        "Provide at least one of: name, description, problemStatement, goal."
      );
    }

    const updatedBy = req.admin.adminId;

    // ── Call service (activity tracking happens inside the service) ──
    const result = await updateProjectService(projectId, {
      name,
      description,
      problemStatement,
      goal,
      updatedBy,
      projectUpdationReasonType,
      projectUpdationReasonDescription,
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
        result.message === "Project is already completed"
      ) {
        return throwBadRequestError(res, result.message, result.message);
      }
      if (result.message === "No changes detected") {
        return throwBadRequestError(
          res,
          "No changes detected",
          "The submitted values are identical to the existing project details. Nothing was updated."
        );
      }
      if (result.message === "Validation error") {
        return throwBadRequestError(res, "Validation error", result.error);
      }
      logMiddlewareError("updateProject", result.message, req);
      return throwSpecificInternalServerError(res, result.message);
    }

    // ── Success ───────────────────────────────────────────────────────
    return sendProjectUpdatedSuccess(res, result.project);
  } catch (error) {
    logMiddlewareError("updateProject", `Unexpected error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { updateProjectController };
