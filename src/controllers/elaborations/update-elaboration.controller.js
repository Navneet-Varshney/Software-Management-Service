// controllers/elaborations/update-elaboration.controller.js

const { updateElaborationService } = require("../../services/elaborations/update-elaboration.service");
const {
  sendElaborationUpdatedSuccess,
} = require("../../responses/success/elaboration.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const updateElaborationController = async (req, res) => {
  const { projectId } = req.params;
  const updateData = req.body;

  const result = await updateElaborationService({
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
      const resource = result.message.includes("Project") ? "Project" : "Elaboration";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendElaborationUpdatedSuccess(res, result.elaboration);
};

module.exports = { updateElaborationController };
