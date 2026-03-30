// middlewares/negotiations/validate-request-body.middleware.js

const { requiredFields } = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
  deleteNegotiationPresenceMiddleware: checkBodyPresence("deleteNegotiationPresence", requiredFields.deleteNegotiationField),
};

module.exports = { presenceMiddlewares };
