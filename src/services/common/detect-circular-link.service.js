const { ProjectModel } = require("@/models");
const { createDetectCircularLink } = require("../factory/circular-link.service-factory");

const detectCircularProjectLink = createDetectCircularLink({
  model: ProjectModel,
  linkField: "linkedProjectIds"
});

module.exports = {
  detectCircularProjectLink
};