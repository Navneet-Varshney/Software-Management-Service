const express = require("express");
const testRouter = express.Router();

const { TEST_ROUTES } = require("@/configs/uri.config");
const { welcomeAdminRateLimiter, welcomeClientRateLimiter } = require("@rate-limiters/general-api.rate-limiter");
const { welcomeController } = require("@/controllers/welcome.controller");
const { baseAuthAdminMiddlewares, baseAuthClientMiddlewares } = require("./middleware.gateway.routes");
const { WELCOME_ADMIN, WELCOME_CLIENT } = TEST_ROUTES;

testRouter.get(`${WELCOME_ADMIN}`,
  [ 
    ...baseAuthAdminMiddlewares, 
    welcomeAdminRateLimiter
  ] , 
  welcomeController);

testRouter.get(`${WELCOME_CLIENT}`,
    [
        ...baseAuthClientMiddlewares,
        welcomeClientRateLimiter
    ],
    welcomeController);

module.exports = {
    testRouter
}