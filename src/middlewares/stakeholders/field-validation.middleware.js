// middlewares/stakeholders/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = {
  createStakeholderValidationMiddleware: validateBody("createStakeholder", validationSets.createStakeholderValidationSet),
  updateStakeholderValidationMiddleware: validateBody("updateStakeholder", validationSets.updateStakeholderValidationSet),
  deleteStakeholderValidationMiddleware: validateBody("deleteStakeholder", validationSets.deleteStakeholderValidationSet)
};

module.exports = { validationMiddlewares };
