// middlewares/elaborations/index.js

const { fetchElaborationMiddleware } = require("./fetch-elaboration.middleware");
const { fetchLatestElaborationMiddleware } = require("./fetch-latest-elaboration.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const elaborationMiddlewares = {
  fetchElaborationMiddleware,
  fetchLatestElaborationMiddleware,
  ...presenceMiddlewares,
  ...validationMiddlewares
};

module.exports = { elaborationMiddlewares };
