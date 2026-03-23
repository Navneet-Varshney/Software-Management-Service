// controllers/high-level-features/index.js

const { createHlfController } = require("./create-hlf.controller");
const { deleteHlfController } = require("./delete-hlf.controller");
const { getHlfController } = require("./get-hlf.controller");
const { listHlfController } = require("./list-hlf.controller");
const { updateHlfController } = require("./update-hlf.controller");

const hlfControllers = {
    createHlfController,
    updateHlfController,
    getHlfController,
    listHlfController,
    deleteHlfController
}

module.exports = { hlfControllers };
