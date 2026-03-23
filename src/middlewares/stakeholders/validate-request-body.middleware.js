// middlewares/stakeholders/validate-request-body.middleware.js

const {
  requiredFields
} = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
  createStakeholderPresenceMiddleware: checkBodyPresence("createStakeholderPresence", requiredFields.createStakeholderField),
  updateStakeholderPresenceMiddleware: checkBodyPresence("updateStakeholderPresence", requiredFields.updateStakeholderField),
  deleteStakeholderPresenceMiddleware: checkBodyPresence("deleteStakeholderPresence", requiredFields.deleteStakeholderField),
};

module.exports = { presenceMiddlewares };
