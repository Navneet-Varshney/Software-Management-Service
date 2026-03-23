// middlewares/high-level-features/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = {
  createHlfValidationMiddleware: validateBody("createHlf", validationSets.createHlfValidationSet),
  updateHlfValidationMiddleware: validateBody("updateHlf", validationSets.updateHlfValidationSet),
  deleteHlfValidationMiddleware: validateBody("deleteHlf", validationSets.deleteHlfValidationSet)
};

module.exports = { validationMiddlewares };
