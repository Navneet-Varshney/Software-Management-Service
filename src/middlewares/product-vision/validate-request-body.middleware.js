// middlewares/product-vision/validate-request-body.middleware.js

const { requiredFields } = require("@configs/required-fields.config");
const { checkBodyPresence } = require("@middlewares/factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
  createProductVisionPresenceMiddleware: checkBodyPresence("createProductVisionPresence", requiredFields.createProductVisionField),
  updateProductVisionPresenceMiddleware: checkBodyPresence("updateProductVisionPresence", requiredFields.updateProductVisionField),
  deleteProductVisionPresenceMiddleware: checkBodyPresence("deleteProductVisionPresence", requiredFields.deleteProductVisionField)
};

module.exports = { presenceMiddlewares };
