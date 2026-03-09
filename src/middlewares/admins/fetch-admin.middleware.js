const { fetchEntityFactory } = require("@middlewares/factory/fetch-entity.middleware-factory");
const { fetchAdmin } = require("@/services/common/fetch-admin.service");
const { logWithTime } = require("@/utils/time-stamps.util");
const { logMiddlewareError } = require("@/utils/log-error.util");
const { throwDBResourceNotFoundError, throwInternalServerError } = require("@/responses/common/error-handler.response");

/**
 * CASE 1: LOGIN / GET DETAILS
 * Ye check karega ki Admin EXIST karta hai.
 * Agar nahi mila -> 404 Error throw karega.
 * Use: Login, Forgot Password, Get Profile
 */
const ensureAdminExists = fetchEntityFactory(fetchAdmin, "Admin", true);

/**
 * CASE 2: REGISTRATION
 * Ye check karega ki Admin EXIST NAHI karta.
 * Agar mil gaya -> 409 Conflict Error throw karega.
 * Use: Sign Up, Create Admin
 */
const ensureAdminNew = fetchEntityFactory(fetchAdmin, "Admin", false);

const fetchRequestAdmin = async (req, res, next) => {
    try {
        const userId = req.userId; // JWT verification middleware ne inject kiya hai
        const foundAdmin = await fetchAdmin(null, null, userId);

        if (!foundAdmin) {
            logMiddlewareError("fetchRequestAdmin", `Admin not found during request admin fetch`, req);
            return throwDBResourceNotFoundError(res, "Admin");
        }

        logWithTime(`✅ Request admin fetched: ${foundAdmin.adminId}`);

        req.admin = foundAdmin; // Downstream middlewares/controllers ke liye admin attach kar diya
        return next();
    } catch (err) {
        logMiddlewareError("fetchRequestAdmin", `Unexpected error: ${err.message}`, req);
        return throwInternalServerError(res, err);
    }
}

module.exports = { 
    ensureAdminExists, 
    ensureAdminNew,
    fetchRequestAdmin
};