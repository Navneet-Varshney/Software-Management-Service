const { DeviceModel } = require("@models/device.model");
const { logMiddlewareError } = require("@utils/log-error.util");
const { throwAccessDeniedError, throwInternalServerError } = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

const isDeviceBlocked = async (req, res, next) => {
    try {

        const update = {};
        
        // Agar deviceType header se aaya hai to DB me update karo
        if (req.device.deviceType) {
            update.deviceType = req.device.deviceType;
        }logWithTime, logMiddlewareError

        const dbDevice = await DeviceModel.findOneAndUpdate(
            { deviceUUID: req.device.deviceUUID },
            update,
            { new: true, lean: true }
        );

        let device = req.device;

        if (dbDevice) {
            device = dbDevice;
            req.device = device;
        }

        if (dbDevice && device.isBlocked === true) {
            logMiddlewareError("isDeviceBlocked", "Device is blocked", req);
            return throwAccessDeniedError(
                res,
                "Your Device is currently blocked. Please contact support for assistance if you believe this is an error."
            );
        }

        logWithTime(`✅ Device (${device.deviceUUID}) is not blocked`);

        return next();

    } catch (err) {
        logMiddlewareError("isDeviceBlocked", "Internal error during device blocked check", req);
        return throwInternalServerError(res, err);
    }
}

module.exports = {
    isDeviceBlocked
}