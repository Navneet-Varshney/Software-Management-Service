// controllers/specifications/update-specification.controller.js

const { updateSpecificationService } = require("../../services/specifications/update-specification.service");
const {
  sendSpecificationUpdatedSuccess,
} = require("../../responses/success/specification.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const updateSpecificationController = async (req, res) => {
  const { projectId } = req.params;
  const updateData = req.body;

  const result = await updateSpecificationService({
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
      const resource = result.message.includes("Project") ? "Project" : "Specification";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendSpecificationUpdatedSuccess(res, result.specification);
};

module.exports = { updateSpecificationController };
