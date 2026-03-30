// controllers/negotiations/get-negotiation.controller.js

const { getNegotiationService } = require("../../services/negotiations/get-negotiation.service");
const {
  sendNegotiationRetrievedSuccess,
} = require("../../responses/success/negotiation.response");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");

const getNegotiationController = async (req, res) => {
  const { projectId } = req.params;

  const result = await getNegotiationService({ projectId });

  if (!result.success) {
    if (result.message.includes("not found")) {
      const resource = result.message.includes("Project") ? "Project" : "Negotiation";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendNegotiationRetrievedSuccess(res, result.negotiation);
};

module.exports = { getNegotiationController };
