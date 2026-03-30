// controllers/elaborations/freeze-elaboration.controller.js

const { freezeElaborationService } = require("../../services/elaborations/freeze-elaboration.service");
const {
  sendElaborationFrozenSuccess,
} = require("../../responses/success/elaboration.response");
const {
  throwConflictError,
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const freezeElaborationController = async (req, res) => {
  const { projectId } = req.params;

  const result = await freezeElaborationService({
    projectId,
    frozenBy: req.admin.adminId,
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

  return sendElaborationFrozenSuccess(res, result.elaboration);
};

module.exports = { freezeElaborationController };
