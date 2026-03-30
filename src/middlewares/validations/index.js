// middlewares/validations/index.js

const { fetchValidationMiddleware } = require("./fetch-validation.middleware");
const { fetchLatestValidationMiddleware } = require("./fetch-latest-validation.middleware");
const { validationMiddlewares: fieldValidationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const validationMiddlewares = {
  fetchValidationMiddleware,
  fetchLatestValidationMiddleware,
  ...presenceMiddlewares,
  ...fieldValidationMiddlewares
};

module.exports = { validationMiddlewares };
