// controllers/elaborations/get-elaboration.controller.js

const { getElaborationService } = require("../../services/elaborations/get-elaboration.service");
const {
  sendElaborationRetrievedSuccess,
} = require("../../responses/success/elaboration.response");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");

const getElaborationController = async (req, res) => {
  const { projectId } = req.params;

  const result = await getElaborationService({ projectId });

  if (!result.success) {
    if (result.message.includes("not found")) {
      const resource = result.message.includes("Project") ? "Project" : "Elaboration";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendElaborationRetrievedSuccess(res, result.elaboration);
};

module.exports = { getElaborationController };
