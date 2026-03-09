const { 
    authServiceMiddleware,
    adminPanelServiceMiddleware
} = require("@middlewares/internals/verify-service-name.middleware");
const { commonMiddlewares } = require("@middlewares/common/index");
const { adminMiddlewares } = require("@/middlewares/admins");
const { clientMiddlewares } = require("@/middlewares/clients");

const baseMiddlewares = [
    commonMiddlewares.requestIdMiddleware,
    commonMiddlewares.verifyDeviceField,
    commonMiddlewares.isDeviceBlocked
];

const accountStatusMiddlewares = [
    commonMiddlewares.isUserAccountBlocked,
    commonMiddlewares.isUserAccountActive
]

const authInternalMiddlewares = [
    ...baseMiddlewares,
    authServiceMiddleware
];

const baseAuthMiddlewares = [
    ...baseMiddlewares,
    commonMiddlewares.validateRedisPayloadMiddleware,
    commonMiddlewares.validateJwtPayloadMiddleware,
    commonMiddlewares.verifyJWTSignatureMiddleware
]

const baseAuthAdminMiddlewares = [
    ...baseAuthMiddlewares,
    adminMiddlewares.fetchRequestAdmin,
    ...accountStatusMiddlewares
]

const baseAuthClientMiddlewares = [
    ...baseAuthMiddlewares,
    clientMiddlewares.fetchRequestClient,
    ...accountStatusMiddlewares
]

const adminPanelInternalMiddlewares = [
    ...baseMiddlewares,
    adminPanelServiceMiddleware
];


module.exports = {
    authInternalMiddlewares,
    adminPanelInternalMiddlewares,
    baseAuthAdminMiddlewares,
    baseAuthClientMiddlewares
};