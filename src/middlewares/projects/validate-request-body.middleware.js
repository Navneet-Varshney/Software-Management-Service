// middlewares/admins/validate-request-body.middleware.js

const {
  createProjectField,
  updateProjectField,
  onHoldProjectField,
  abortProjectField,
  completeProjectField,
  resumeProjectField,
  deleteProjectField,
  archiveProjectField,
} = require("@configs/required-fields.config");
const { checkBodyPresence } = require("../factory/validate-request-body.middleware-factory");

const presenceMiddlewares = { 
  createProjectPresenceMiddleware:   checkBodyPresence("createProjectPresence",   createProjectField),
  updateProjectPresenceMiddleware:   checkBodyPresence("updateProjectPresence",   updateProjectField),
  onHoldProjectPresenceMiddleware:   checkBodyPresence("onHoldProjectPresence",   onHoldProjectField),
  abortProjectPresenceMiddleware:    checkBodyPresence("abortProjectPresence",    abortProjectField),
  completeProjectPresenceMiddleware: checkBodyPresence("completeProjectPresence", completeProjectField),
  resumeProjectPresenceMiddleware:   checkBodyPresence("resumeProjectPresence",   resumeProjectField),
  deleteProjectPresenceMiddleware:   checkBodyPresence("deleteProjectPresence",   deleteProjectField),
  archiveProjectPresenceMiddleware:  checkBodyPresence("archiveProjectPresence",  archiveProjectField),
};

module.exports = { presenceMiddlewares };
