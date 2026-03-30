// controllers/validations/update-validation.controller.js

const { updateValidationService } = require("../../services/validations/update-validation.service");
const {
  sendValidationUpdatedSuccess,
} = require("../../responses/success/validation.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const updateValidationController = async (req, res) => {
  const { projectId } = req.params;
  const updateData = req.body;

  const result = await updateValidationService({
    projectId,
    updateData,
    updatedBy: req.admin.adminId,
    auditContext: req.auditContext,
  });

  if (!result.success) {
    if (result.errorCode === CONFLICT) {
      return throwConflictError(res, result.message);
    }
    if (result.errorCode === NOT_FOUND) {
      const resource = result.message.includes("Project") ? "Project" : "Validation";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendValidationUpdatedSuccess(res, result.validation);
};

module.exports = { updateValidationController };
