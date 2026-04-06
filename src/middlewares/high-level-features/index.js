// middlewares/high-level-features/index.js

const { fetchHlfMiddleware } = require("./fetch-hlf.middleware");
const { fetchInceptionFromProjectMiddleware } = require("./fetch-inception-from-project.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");

const hlfMiddlewares = {
  fetchHlfMiddleware, 
  fetchInceptionFromProjectMiddleware,
  ...validationMiddlewares,
  ...presenceMiddlewares,
};

module.exports = { hlfMiddlewares };
