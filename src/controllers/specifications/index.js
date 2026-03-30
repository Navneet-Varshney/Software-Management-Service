// controllers/specifications/index.js

const { createSpecificationController } = require("./create-specification.controller");
const { deleteSpecificationController } = require("./delete-specification.controller");
const { updateSpecificationController } = require("./update-specification.controller");
const { getSpecificationController } = require("./get-specification.controller");
const { getLatestSpecificationController } = require("./get-latest-specification.controller");
const { listSpecificationsController } = require("./list-specifications.controller");
const { freezeSpecificationController } = require("./freeze-specification.controller");

const specificationControllers = {
  createSpecificationController,
  deleteSpecificationController,
  updateSpecificationController,
  getSpecificationController,
  getLatestSpecificationController,
  listSpecificationsController,
  freezeSpecificationController,
};

module.exports = { specificationControllers };
