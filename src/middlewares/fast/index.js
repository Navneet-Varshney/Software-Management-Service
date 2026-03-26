// middlewares/fast/index.js

const { fetchFastMiddleware } = require("./fetch-fast.middleware");
const { validationMiddlewares } = require("../elicitations/validate-request-body.middleware");
const { checkUserIsStakeholder } = require("../stakeholders/check-user-is-stakeholder.middleware");

const fastMiddlewares = {
  fetchFastMiddleware,
  ...validationMiddlewares,
  checkUserIsStakeholder // Reuse existing stakeholder check
};

module.exports = { fastMiddlewares };
