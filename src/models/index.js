const { ActivityTrackerModel } = require("./activity-tracker.model");
const { AdminModel } = require("./admin.model");
const { ServiceTrackerModel } = require("./service-tracker.model");
const { DeviceModel } = require("./device.model")
const { ServiceToken } = require("./service-token.model");
const { ClientModel } = require("./client.model");
const { ProjectModel } = require("./project.model");
const { InceptionModel } = require("./inception.model");

const models = {
    ActivityTrackerModel,
    AdminModel,
    ServiceTrackerModel,
    DeviceModel,
    ServiceToken,
    ClientModel,
    ProjectModel,
    InceptionModel
}

module.exports = {
    ...models
}