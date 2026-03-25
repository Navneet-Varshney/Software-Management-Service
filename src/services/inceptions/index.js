// services/inceptions/index.js

const { getInceptionService } = require("./get-latest-inception.service");
const { listInceptionsService } = require("./list-inceptions.service");
const { deleteInceptionService } = require("./delete-inception.service");

const inceptionServices = {
  getInceptionService,
  listInceptionsService,
  deleteInceptionService
};

module.exports = { inceptionServices };
