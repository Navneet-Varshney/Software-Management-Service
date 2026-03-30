// middlewares/negotiations/index.js

const { fetchNegotiationMiddleware } = require("./fetch-negotiation.middleware");
const { fetchLatestNegotiationMiddleware } = require("./fetch-latest-negotiation.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const negotiationMiddlewares = {
  fetchNegotiationMiddleware,
  fetchLatestNegotiationMiddleware,
  ...presenceMiddlewares,
    ...validationMiddlewares
};

module.exports = { negotiationMiddlewares };
