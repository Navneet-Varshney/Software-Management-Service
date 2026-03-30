// middlewares/specifications/index.js

const { fetchSpecificationMiddleware } = require("./fetch-specification.middleware");
const { fetchLatestSpecificationMiddleware } = require("./fetch-latest-specification.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const specificationMiddlewares = {
  fetchSpecificationMiddleware,
  fetchLatestSpecificationMiddleware,
    ...presenceMiddlewares,
    ...validationMiddlewares
};

module.exports = { specificationMiddlewares };
