// controllers/negotiations/update-negotiation.controller.js

const { updateNegotiationService } = require("../../services/negotiations/update-negotiation.service");
const {
  sendNegotiationUpdatedSuccess,
} = require("../../responses/success/negotiation.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const updateNegotiationController = async (req, res) => {
  const { projectId } = req.params;
  const updateData = req.body;

  const result = await updateNegotiationService({
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
      const resource = result.message.includes("Project") ? "Project" : "Negotiation";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendNegotiationUpdatedSuccess(res, result.negotiation);
};

module.exports = { updateNegotiationController };
