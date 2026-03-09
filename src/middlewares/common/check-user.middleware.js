const { throwInternalServerError, throwAccessDeniedError } = require("@/responses/common/error-handler.response");
const { isValidCustomId } = require("@/utils/id-validators.util");
const { logMiddlewareError } = require("@/utils/log-error.util");
const { logWithTime } = require("@/utils/time-stamps.util");

const checkUserMiddleware = (req, res, next) => {
    try {

        const userId = req.body.userId; // This should be injected by the JWT verification middleware

        // Check if userId has valid format (all IDs now use USR prefix)
        if (!isValidCustomId(userId)) {
            logMiddlewareError("checkUser", `Invalid User ID format: ${userId}`, req);
            return throwAccessDeniedError(res, "Invalid user ID format");
        }

        logWithTime(`✅ User ID verified: ${userId}`);

        // If it passes the check, proceed to next middleware
        return next();
    } catch (err) {
        logMiddlewareError("checkUser", `Unexpected error: ${err.message}`, req);
        return throwInternalServerError(res, err);
    }
};

module.exports = { 
    checkUserMiddleware 
};