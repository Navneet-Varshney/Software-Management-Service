// controllers/specifications/get-specification.controller.js

const { getSpecificationService } = require("../../services/specifications/get-specification.service");
const {
  sendSpecificationRetrievedSuccess,
} = require("../../responses/success/specification.response");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");

const getSpecificationController = async (req, res) => {
  const { projectId } = req.params;

  const result = await getSpecificationService({ projectId });

  if (!result.success) {
    if (result.message.includes("not found")) {
      const resource = result.message.includes("Project") ? "Project" : "Specification";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendSpecificationRetrievedSuccess(res, result.specification);
};

module.exports = { getSpecificationController };
