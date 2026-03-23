const {
    requiredFields
} = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = {
    createProductRequestPresenceMiddleware: checkBodyPresence("createProductRequestPresence", requiredFields.createProductRequestField),
    updateProductRequestPresenceMiddleware: checkBodyPresence("updateProductRequestPresence", requiredFields.updateProductRequestField),
    deleteProductRequestPresenceMiddleware: checkBodyPresence("deleteProductRequestPresence", requiredFields.deleteProductRequestField),
    approveProductRequestPresenceMiddleware: checkBodyPresence("approveProductRequestPresence", requiredFields.approveProductRequestField),
    rejectProductRequestPresenceMiddleware: checkBodyPresence("rejectProductRequestPresence", requiredFields.rejectProductRequestField),
};

module.exports = { presenceMiddlewares };