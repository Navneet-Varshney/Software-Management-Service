// middlewares/product-vision/index.js

const { fetchInceptionFromProjectMiddleware } = require("./fetch-inception-from-project.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const productVisionMiddlewares = {
  fetchInceptionFromProjectMiddleware,
  ...validationMiddlewares,
  ...presenceMiddlewares,
};

module.exports = { productVisionMiddlewares };
