const { adminApiAuthorizationMiddleware } = require("./admin-api-authorization.middleware");
const { ensureAdminExists, ensureAdminNew, fetchRequestAdmin } = require("./fetch-admin.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const adminMiddlewares = {
    ensureAdminExists,
    ensureAdminNew,
    fetchRequestAdmin,
    adminApiAuthorizationMiddleware,
    ...validationMiddlewares,
    ...presenceMiddlewares
}
module.exports = { 
    adminMiddlewares
};