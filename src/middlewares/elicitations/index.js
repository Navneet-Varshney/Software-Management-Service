// middlewares/elicitations/index.js

const { fetchElicitationMiddleware } = require("./fetch-elicitation.middleware");
const { validationMiddlewares } = require("./validate-request-body.middleware");
const { checkUserIsStakeholder } = require("../stakeholders/check-user-is-stakeholder.middleware");

const elicitationMiddlewares = {
  fetchElicitationMiddleware,
  ...validationMiddlewares,
  checkUserIsStakeholder // Reuse existing stakeholder check
};

module.exports = { elicitationMiddlewares };
