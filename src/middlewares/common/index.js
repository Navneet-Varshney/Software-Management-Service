const { requestIdMiddleware } = require("./check-request-id.middleware");
const { isUserAccountActive } = require("./is-account-active.middleware");
const { isDeviceBlocked } = require("./is-device-blocked.middleware");
const { isUserAccountBlocked } = require("./is-user-blocked.middleware");
const { validateJwtPayloadMiddleware } = require("./validate-jwt-payload.middleware");
const { validateRedisPayloadMiddleware } = require("./validate-redis-payload.middleware");
const { verifyDeviceField } = require("./verify-device-field.middleware");
const { verifyJWTSignatureMiddleware } = require("./verify-jwt-signature.middleware");

const commonMiddlewares = {
    requestIdMiddleware,
    isDeviceBlocked,
    verifyDeviceField,
    verifyJWTSignatureMiddleware,
    validateJwtPayloadMiddleware,
    validateRedisPayloadMiddleware,
    isUserAccountBlocked,
    isUserAccountActive
}

module.exports = {
    commonMiddlewares
}