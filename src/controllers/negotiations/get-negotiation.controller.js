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
  const negotiation = req.negotiation; // Set by previous middleware
  const result = await getNegotiationService(negotiation);

  if (!result.success) {
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendNegotiationRetrievedSuccess(res, result.negotiation);
};

module.exports = { getNegotiationController };
