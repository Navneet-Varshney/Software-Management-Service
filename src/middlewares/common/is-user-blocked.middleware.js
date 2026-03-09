const { throwInternalServerError, logMiddlewareError, throwAccessDeniedError } = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

// Checking if user Account is Blocked
const isUserAccountBlocked = async (req, res, next) => {
    try {
        const user = req?.admin || req?.client || req?.foundAdmin || req?.foundClient; // Flexibility to check in multiple places where user might be attached
        if (user.isBlocked === true) {
            logMiddlewareError("isUserAccountBlocked", "User account is blocked", req);
            return throwAccessDeniedError(res, "Your account has been blocked. Please contact support for assistance.");
        }
        const id = user.adminId || user.clientId || "Unknown ID";
        // Active user – Allow to proceed
        logWithTime(`✅ User (${id}) account is not blocked`);
        return next();
    } catch (err) {
        logMiddlewareError("isUserAccountBlocked", "Internal error during user blocked check", req);
        return throwInternalServerError(res, err);
    }
}

module.exports = {
    isUserAccountBlocked
}