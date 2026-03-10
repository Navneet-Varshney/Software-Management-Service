/**
 * CENTRALIZED FIELD DEFINITIONS CONFIG
 *
 * Single Source of Truth for:
 * - Required fields per endpoint/action
 * - Validation rules mapping
 * - Field-level metadata
 *
 * NOTE: createdBy / updatedBy are NOT listed here because they are
 * derived from req.admin.adminId inside the controller —
 * callers must never send them in the request body.
 */

const { validationRules } = require("./validation.config");

const FieldDefinitions = {

  // ── Kept for reference – expand when CREATE_ADMIN endpoint is built ──
  CREATE_ADMIN: {
    ADMIN_TYPE: {
      field: "adminType",
      required: true,
      validation: validationRules.adminType,
      description: "Type of admin (SUPER_ADMIN, SUB_ADMIN)"
    }
  },

  // ── CREATE PROJECT ───────────────────────────────────────────────────
  CREATE_PROJECT: {
    NAME: {
      field: "name",
      required: true,
      validation: validationRules.projectName,
      description: "Human-readable project name"
    },
    DESCRIPTION: {
      field: "description",
      required: true,
      validation: validationRules.projectDescription,
      description: "Detailed description of the project"
    },
    PROBLEM_STATEMENT: {
      field: "problemStatement",
      required: true,
      validation: validationRules.problemStatement,
      description: "Problem the project aims to solve"
    },
    GOAL: {
      field: "goal",
      required: true,
      validation: validationRules.projectGoal,
      description: "Primary goal / expected outcome"
    },
    CREATION_REASON: {
      field: "projectCreationReason",
      required: true,
      validation: validationRules.projectCreationReason,
      description: "Why is this project being created?"
    },
  },

  // ── UPDATE PROJECT ───────────────────────────────────────────────────
  UPDATE_PROJECT: {
    // Optional fields – validated only when present in req.body
    NAME: {
      field: "name",
      required: false,
      validation: validationRules.projectName,
      description: "Updated project name"
    },
    DESCRIPTION: {
      field: "description",
      required: false,
      validation: validationRules.projectDescription,
      description: "Updated project description"
    },
    PROBLEM_STATEMENT: {
      field: "problemStatement",
      required: false,
      validation: validationRules.problemStatement,
      description: "Updated problem statement"
    },
    GOAL: {
      field: "goal",
      required: false,
      validation: validationRules.projectGoal,
      description: "Updated project goal"
    },
    // Always required – caller must always explain why they are updating
    UPDATION_REASON: {
      field: "projectUpdationReason",
      required: true,
      validation: validationRules.projectUpdationReason,
      description: "Why is this project being updated?"
    },
  },

};

module.exports = { FieldDefinitions };
