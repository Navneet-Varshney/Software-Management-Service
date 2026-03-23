// middlewares/product-requests/field-validation.middleware.js

const { validationSets } = require("@/configs/validation-sets.config");
const { validateBody } = require("@middlewares/factory/field-validation.middleware-factory");

const validationMiddlewares = { 
  createProductRequestValidationMiddleware:  validateBody("createProductRequest",  validationSets.createProductRequestValidationSet),
  updateProductRequestValidationMiddleware:  validateBody("updateProductRequest",  validationSets.updateProductRequestValidationSet),
  deleteProductRequestValidationMiddleware:  validateBody("deleteProductRequest",  validationSets.deleteProductRequestValidationSet),
  approveProductRequestValidationMiddleware: validateBody("approveProductRequest", validationSets.approveProductRequestValidationSet),
  rejectProductRequestValidationMiddleware:  validateBody("rejectProductRequest",  validationSets.rejectProductRequestValidationSet),
};

module.exports = { validationMiddlewares };
