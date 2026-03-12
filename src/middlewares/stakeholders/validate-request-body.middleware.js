// middlewares/stakeholders/validate-request-body.middleware.js

const {
  createStakeholderField,
  updateStakeholderField,
  deleteStakeholderField,
} = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
  createStakeholderPresenceMiddleware: checkBodyPresence("createStakeholderPresence",createStakeholderField),
  updateStakeholderPresenceMiddleware: checkBodyPresence("updateStakeholderPresence",updateStakeholderField),
  deleteStakeholderPresenceMiddleware: checkBodyPresence("deleteStakeholderPresence",deleteStakeholderField),
};

module.exports = { presenceMiddlewares };
