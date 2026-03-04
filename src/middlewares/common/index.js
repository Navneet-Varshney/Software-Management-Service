const { requestIdMiddleware } = require("./check-request-id.middleware");
const { isDeviceBlocked } = require("./is-device-blocked.middleware");
const { verifyDeviceField } = require("./verify-device-field.middleware");

const commonMiddlewares = {
    requestIdMiddleware,
    isDeviceBlocked,
    verifyDeviceField
}

module.exports = {
    commonMiddlewares
}