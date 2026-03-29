const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const participantMiddlewares = {
    ...validationMiddlewares,
    ...presenceMiddlewares
}

module.exports = { participantMiddlewares };