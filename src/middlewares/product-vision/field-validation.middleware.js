// middlewares/product-vision/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = {
  createProductVisionValidationMiddleware: validateBody("createProductVision", validationSets.createProductVisionValidationSet),
  updateProductVisionValidationMiddleware: validateBody("updateProductVision", validationSets.updateProductVisionValidationSet),
  deleteProductVisionValidationMiddleware: validateBody("deleteProductVision", validationSets.deleteProductVisionValidationSet)
};

module.exports = { validationMiddlewares };
