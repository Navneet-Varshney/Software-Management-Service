// controllers/negotiations/list-negotiations.controller.js

const { listNegotiationsService } = require("../../services/negotiations/list-negotiations.service");
const {
  sendNegotiationListSuccess,
} = require("../../responses/success/negotiation.response");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");

const listNegotiationsController = async (req, res) => {
  const { projectId } = req.params;
  const { pageNumber = 1, pageSize = 10 } = req.query;

  const result = await listNegotiationsService({
    projectId,
    pageNumber: parseInt(pageNumber),
    pageSize: parseInt(pageSize),
  });

  if (!result.success) {
    if (result.message.includes("not found")) {
      const resource = result.message.includes("Project") ? "Project" : "Negotiation";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendNegotiationListSuccess(res, result.negotiations, result.pagination);
};

module.exports = { listNegotiationsController };
