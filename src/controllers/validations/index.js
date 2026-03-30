// controllers/validations/index.js

const { createValidationController } = require("./create-validation.controller");
const { deleteValidationController } = require("./delete-validation.controller");
const { updateValidationController } = require("./update-validation.controller");
const { getValidationController } = require("./get-validation.controller");
const { getLatestValidationController } = require("./get-latest-validation.controller");
const { listValidationsController } = require("./list-validations.controller");
const { freezeValidationController } = require("./freeze-validation.controller");

const validationControllers = {
  createValidationController,
  deleteValidationController,
  updateValidationController,
  getValidationController,
  getLatestValidationController,
  listValidationsController,
  freezeValidationController,
};

module.exports = { validationControllers };
