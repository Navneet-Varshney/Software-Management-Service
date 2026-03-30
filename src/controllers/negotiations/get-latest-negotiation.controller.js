// controllers/negotiations/get-latest-negotiation.controller.js

const { getLatestNegotiationService } = require("../../services/negotiations/get-latest-negotiation.service");
const {
  sendNegotiationLatestRetrievedSuccess,
} = require("../../responses/success/negotiation.response");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");


const getLatestNegotiationController = async (req, res) => {
  const { projectId } = req.params;

  const result = await getLatestNegotiationService({ projectId });

  if (!result.success) {
    if (result.message.includes("not found")) {
      const resource = result.message.includes("Project") ? "Project" : "Negotiation";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendNegotiationLatestRetrievedSuccess(res, result.negotiation);
};

module.exports = { getLatestNegotiationController };
