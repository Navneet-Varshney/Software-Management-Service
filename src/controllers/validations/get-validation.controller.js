// controllers/validations/get-validation.controller.js

const { getValidationService } = require("../../services/validations/get-validation.service");
const {
  sendValidationRetrievedSuccess,
} = require("../../responses/success/validation.response");
const {
  throwInternalServerError,
  throwDBResourceNotFoundError,
} = require("@/responses/common/error-handler.response");

const getValidationController = async (req, res) => {
  const { projectId } = req.params;

  const result = await getValidationService({ projectId });

  if (!result.success) {
    if (result.message.includes("not found")) {
      const resource = result.message.includes("Project") ? "Project" : "Validation";
      return throwDBResourceNotFoundError(res, resource);
    }
    return throwInternalServerError(res, new Error(result.message));
  }

  return sendValidationRetrievedSuccess(res, result.validation);
};

module.exports = { getValidationController };
