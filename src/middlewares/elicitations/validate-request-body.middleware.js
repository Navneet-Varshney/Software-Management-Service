// middlewares/elicitations/validate-request-body.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = {
  deleteElicitationValidationMiddleware: validateBody("deleteElicitation", validationSets.deleteElicitationValidationSet),
  updateElicitationValidationMiddleware: validateBody("updateElicitation", validationSets.updateElicitationValidationSet),
  createFastValidationMiddleware: validateBody("createFast", validationSets.createFastValidationSet),
  updateFastValidationMiddleware: validateBody("updateFast", validationSets.updateFastValidationSet),
  addFastParticipantValidationMiddleware: validateBody("addFastParticipant", validationSets.addFastParticipantValidationSet),
  removeFastParticipantValidationMiddleware: validateBody("removeFastParticipant", validationSets.removeFastParticipantValidationSet),
};

module.exports = { validationMiddlewares };
