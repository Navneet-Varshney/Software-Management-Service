// controllers/specifications/delete-specification.controller.js

const { deleteSpecificationService } = require("../../services/specifications/delete-specification.service");
const {
  sendSpecificationDeletedSuccess,
} = require("../../responses/success/specification.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const deleteSpecificationController = async (req, res) => {
  const { projectId } = req.params;
  const { deletionReasonType, deletionReasonDescription } = req.body;

  const result = await deleteSpecificationService({
    projectId,
    deletionReasonType,
    deletionReasonDescription,
    deletedBy: req.admin.adminId,
    auditContext: req.auditContext,
  });

  if (!result.success) {
    if (result.errorCode === NOT_FOUND) {
      const resource = result.message.includes("Project") ? "Project" : "Specification";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendSpecificationDeletedSuccess(res, result.specification);
};

module.exports = { deleteSpecificationController };
