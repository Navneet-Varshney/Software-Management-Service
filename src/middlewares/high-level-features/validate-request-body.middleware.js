// middlewares/high-level-features/validate-request-body.middleware.js

const { requiredFields } = require("@configs/required-fields.config");
const { checkBodyPresence } = require("@middlewares/factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
  createHlfPresenceMiddleware: checkBodyPresence("createHlfPresence", requiredFields.createHlfField),
  updateHlfPresenceMiddleware: checkBodyPresence("updateHlfPresence", requiredFields.updateHlfField),
  deleteHlfPresenceMiddleware: checkBodyPresence("deleteHlfPresence", requiredFields.deleteHlfField)
};

module.exports = { presenceMiddlewares };
