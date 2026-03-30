// middlewares/specifications/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = {
  deleteSpecificationValidationMiddleware: validateBody("deleteSpecification", validationSets.deleteSpecificationValidationSet),
};

module.exports = { validationMiddlewares };
