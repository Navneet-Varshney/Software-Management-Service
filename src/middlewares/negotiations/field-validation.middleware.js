// middlewares/negotiations/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = {
  deleteNegotiationValidationMiddleware: validateBody("deleteNegotiation", validationSets.deleteNegotiationValidationSet),
};

module.exports = { validationMiddlewares };
