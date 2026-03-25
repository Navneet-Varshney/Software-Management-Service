const { getLatestInceptionController } = require("./get-latest-inception.controller");
const { listInceptionsController } = require("./list-inceptions.controller");
const { deleteInceptionController } = require("./delete-inception.controller");
const { getInceptionController } = require("./get-inception.controller");

const inceptionControllers = {
    getInceptionController,
    getLatestInceptionController,
    listInceptionsController,
    deleteInceptionController
}

module.exports = {
    inceptionControllers
}
