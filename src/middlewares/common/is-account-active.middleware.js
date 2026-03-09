const { logWithTime } = require("@utils/time-stamps.util");
const { throwInternalServerError, logMiddlewareError, throwAccessDeniedError } = require("@/responses/common/error-handler.response");
const { AdminRoleTypes } = require("@configs/enums.config");

// Checking if admin Account is Active
const isUserAccountActive = async (req, res, next) => {
    try {
        const user = req?.admin || req?.client;
        if (user.role === AdminRoleTypes.CEO) { // Super Admin Account can never be deactivated
            logWithTime(`✅ Super Admin (${user.adminId}) bypassed deactivation check`);
            return next();
        }
        if (user.isActive === false) {
            logMiddlewareError("isUserAccountActive", "User account is deactivated", req);
            return throwAccessDeniedError(res, "Your account is currently deactivated. Please activate your account before continuing.");
        }

        // ✅ Active admin – Allow to proceed
        logWithTime(`✅ User account active for ${user.adminId || user.clientId} (${user.role})`);

        return next();
    } catch (err) {
        logMiddlewareError("isUserAccountActive", "Internal error during user active check", req);
        return throwInternalServerError(res, err);
    }
}

module.exports = {
    isUserAccountActive
}