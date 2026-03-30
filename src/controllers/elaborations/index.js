// controllers/elaborations/index.js

const { createElaborationController } = require("./create-elaboration.controller");
const { deleteElaborationController } = require("./delete-elaboration.controller");
const { updateElaborationController } = require("./update-elaboration.controller");
const { getElaborationController } = require("./get-elaboration.controller");
const { getLatestElaborationController } = require("./get-latest-elaboration.controller");
const { listElaborationsController } = require("./list-elaborations.controller");
const { freezeElaborationController } = require("./freeze-elaboration.controller");

const elaborationControllers = {
  createElaborationController,
  deleteElaborationController,
  updateElaborationController,
  getElaborationController,
  getLatestElaborationController,
  listElaborationsController,
  freezeElaborationController,
};

module.exports = { elaborationControllers };
