// middlewares/specifications/validate-request-body.middleware.js

const { requiredFields } = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
  deleteSpecificationPresenceMiddleware: checkBodyPresence("deleteSpecificationPresence", requiredFields.deleteSpecificationField),
};

module.exports = { presenceMiddlewares };
