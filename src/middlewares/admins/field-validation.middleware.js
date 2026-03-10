// middlewares/admins/field-validation.middleware.js

const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");
const { FieldDefinitions } = require("@configs/field-definitions.config");
const { getValidationSet } = require("@utils/field-definition.util");

// Pre-compute validation sets from FieldDefinitions (evaluated once at boot)
const createProjectValidationSet = getValidationSet(FieldDefinitions.CREATE_PROJECT);
const updateProjectValidationSet = getValidationSet(FieldDefinitions.UPDATE_PROJECT);

const validationMiddlewares = {
  /** Validates all CREATE PROJECT fields (lengths + enum). */
  createProjectValidationMiddleware: validateBody("createProject", createProjectValidationSet),

  /** Validates UPDATE PROJECT fields that are present + required reason enum. */
  updateProjectValidationMiddleware: validateBody("updateProject", updateProjectValidationSet)
};

module.exports = { validationMiddlewares };

