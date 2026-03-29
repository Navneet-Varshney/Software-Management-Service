const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@/middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = {
  addParticipantValidationMiddleware: validateBody("addParticipant", validationSets.addParticipantValidationSet),
  updateParticipantValidationMiddleware: validateBody("updateParticipant", validationSets.updateParticipantValidationSet),
  removeParticipantValidationMiddleware: validateBody("removeParticipant", validationSets.removeParticipantValidationSet)
};

module.exports = { validationMiddlewares };