// middlewares/admins/validate-request-body.middleware.js

const { throwMissingFieldsError } = require("@/responses/common/error-handler.response");
const { createProjectField, updateProjectField } = require("@configs/required-fields.config");

/**
 * Factory: builds a presence-check middleware for a given list of required fields.
 * Returns 400 with the list of missing keys if any required field is absent / empty.
 */
const checkPresence = (requiredFields) => (req, res, next) => {
  const missing = requiredFields.filter((field) => {
    const val = req.body[field];
    return val === undefined || val === null || String(val).trim() === "";
  });

  if (missing.length > 0) {
    return throwMissingFieldsError(res, missing);
  }

  return next();
};

// ─────────────────────────────────────────────────────────────────────────────
// Required fields derived automatically from field-definitions.config.js.
// To change what is required just update FieldDefinitions — no edits needed here.
// ─────────────────────────────────────────────────────────────────────────────

const presenceMiddlewares = {
  /** Ensures all required CREATE PROJECT body fields are present. */
  createProjectPresenceMiddleware: checkPresence(createProjectField),

  /** Ensures projectUpdationReason is always present for updates. */
  updateProjectPresenceMiddleware: checkPresence(updateProjectField),
};

module.exports = { presenceMiddlewares };
