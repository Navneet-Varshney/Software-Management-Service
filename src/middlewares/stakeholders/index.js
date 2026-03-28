// middlewares/stakeholders/index.js

const { checkUserIsStakeholder } = require("./check-user-is-stakeholder.middleware");
const {
  createStakeholderRoleGuardMiddleware,
  updateStakeholderRoleGuardMiddleware,
} = require("./role-guard.middleware");
const { validationMiddlewares } = require("./field-validation.middleware");
const { presenceMiddlewares } = require("./validate-request-body.middleware");
const { fetchStakeholderMiddleware } = require("./fetch-stakeholder.middleware");
const { stakeholderRoleAccessMiddlewares } = require("./api-stakeholder-role-access.middleware");

const stakeholderMiddlewares = {
  checkUserIsStakeholder,
  createStakeholderRoleGuardMiddleware,
  updateStakeholderRoleGuardMiddleware,
  fetchStakeholderMiddleware,
  ...validationMiddlewares,
  ...presenceMiddlewares,
  stakeholderRoleAccessMiddlewares
};

module.exports = { stakeholderMiddlewares };
