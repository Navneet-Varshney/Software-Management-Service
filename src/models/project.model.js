// models/project.model.js

const mongoose = require("mongoose");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { customIdRegex } = require("@configs/regex.config");
const { ProjectCreationReason, ProjectUpdationReason } = require("@configs/enums.config");
const {
  projectNameLength,
  projectDescriptionLength,
  problemStatementLength,
  projectGoalLength,
} = require("@configs/fields-length.config");

/**
 * Project Schema
 *
 * `version` is managed automatically:
 *   - Set to "v1.0" on creation
 *   - Minor digit incremented (v1.0 → v1.1 → v1.2 …) on every update
 *
 * `createdAt` / `updatedAt` are provided by `timestamps: true`.
 * `updatedBy` is optionally populated on each PATCH request.
 */
const projectSchema = new mongoose.Schema(
  {
    /* ── Core fields ─────────────────────────────────────────────────── */

    name: {
      type: String,
      required: [true, "Project name is required."],
      trim: true,
      minlength: [projectNameLength.min, `Project name must be at least ${projectNameLength.min} characters.`],
      maxlength: [projectNameLength.max, `Project name must not exceed ${projectNameLength.max} characters.`],
    },

    description: {
      type: String,
      required: [true, "Project description is required."],
      trim: true,
      minlength: [projectDescriptionLength.min, `Description must be at least ${projectDescriptionLength.min} characters.`],
      maxlength: [projectDescriptionLength.max, `Description must not exceed ${projectDescriptionLength.max} characters.`],
    },

    problemStatement: {
      type: String,
      required: [true, "Problem statement is required."],
      trim: true,
      minlength: [problemStatementLength.min, `Problem statement must be at least ${problemStatementLength.min} characters.`],
      maxlength: [problemStatementLength.max, `Problem statement must not exceed ${problemStatementLength.max} characters.`],
    },

    goal: {
      type: String,
      required: [true, "Project goal is required."],
      trim: true,
      minlength: [projectGoalLength.min, `Goal must be at least ${projectGoalLength.min} characters.`],
      maxlength: [projectGoalLength.max, `Goal must not exceed ${projectGoalLength.max} characters.`],
    },

    /* ── Version (auto-managed) ─────────────────────────────────────── */

    version: {
      type: String,
      default: "v1.0",
    },

    /* ── Audit trail ────────────────────────────────────────────────── */

    createdBy: {
      type: String,
      required: [true, "createdBy is required."],
      match: [customIdRegex, "createdBy must be a valid USR ID (USR followed by 7 digits)."],
      immutable: true,
    },

    updatedBy: {
      type: String,
      default: null,
      match: [customIdRegex, "updatedBy must be a valid USR ID (USR followed by 7 digits)."],
    },

    /* ── Reason trail ───────────────────────────────────────────────── */

    projectCreationReason: {
      type: String,
      required: [true, "Project creation reason is required."],
      enum: {
        values: Object.values(ProjectCreationReason),
        message: `projectCreationReason must be one of: ${Object.values(ProjectCreationReason).join(", ")}`
      },
    },

    projectUpdationReason: {
      type: String,
      default: null,
      enum: {
        values: [null, ...Object.values(ProjectUpdationReason)],
        message: `projectUpdationReason must be one of: ${Object.values(ProjectUpdationReason).join(", ")}`
      },
    },
  },
  {
    timestamps: true,   // createdAt + updatedAt
    versionKey: false,  // disable __v (we have our own `version` field)
    collection: DB_COLLECTIONS.PROJECTS,
  }
);

const ProjectModel = mongoose.model("Project", projectSchema);

module.exports = { ProjectModel };
