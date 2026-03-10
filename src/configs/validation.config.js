const {
  projectNameLength,
  projectDescriptionLength,
  problemStatementLength,
  projectGoalLength,
} = require("./fields-length.config");

const {
  ProjectCreationReasonHelper,
  ProjectUpdationReasonHelper,
} = require("@utils/enum-validators.util");

/**
 * Validation rules – single source of truth for field-level constraints.
 *
 * Shape matches what field-validation.middleware-factory.js expects:
 *   length : { min, max }   → string length check
 *   enum   : helperInstance  → enum check via helper.reverseLookup()
 *   regex  : /pattern/      → regex check (optional)
 */
const validationRules = {

  // ── Project string fields ───────────────────────────
  projectName: {
    length: { min: projectNameLength.min, max: projectNameLength.max },
  },
  projectDescription: {
    length: { min: projectDescriptionLength.min, max: projectDescriptionLength.max },
  },
  problemStatement: {
    length: { min: problemStatementLength.min, max: problemStatementLength.max },
  },
  projectGoal: {
    length: { min: projectGoalLength.min, max: projectGoalLength.max },
  },

  // ── Project enum fields ────────────────────────────
  projectCreationReason: {
    enum: ProjectCreationReasonHelper,
  },
  projectUpdationReason: {
    enum: ProjectUpdationReasonHelper,
  },

};

module.exports = {
  validationRules
};
