const { requiredFields } = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = { 
  addParticipantPresenceMiddleware: checkBodyPresence("addParticipantPresence", requiredFields.addParticipantField),
  updateParticipantPresenceMiddleware: checkBodyPresence("updateParticipantPresence", requiredFields.updateParticipantField),
  removeParticipantPresenceMiddleware: checkBodyPresence("removeParticipantPresence", requiredFields.removeParticipantField)
};

module.exports = { presenceMiddlewares };