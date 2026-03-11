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
    CREATION_REASON_TYPE: {
      field: "projectCreationReasonType",
      required: true,
      validation: validationRules.projectCreationReasonType,
      description: "Why is this project being created? (enum)"
    },
    CREATION_REASON_DESCRIPTION: {
      field: "projectCreationReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional free-text elaboration on creation reason"
    },
  },

  // ── UPDATE PROJECT ───────────────────────────────────────────────────
  UPDATE_PROJECT: {
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
    UPDATION_REASON_TYPE: {
      field: "projectUpdationReasonType",
      required: true,
      validation: validationRules.projectUpdationReasonType,
      description: "Why is this project being updated? (enum)"
    },
    UPDATION_REASON_DESCRIPTION: {
      field: "projectUpdationReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional free-text elaboration on updation reason"
    },
  },

  // ── ON_HOLD PROJECT ──────────────────────────────────────
  ON_HOLD_PROJECT: {
    ON_HOLD_REASON_TYPE: {
      field: "onHoldReasonType",
      required: true,
      validation: validationRules.onHoldReasonType,
      description: "Reason category for putting on hold (enum)"
    },
    ON_HOLD_REASON_DESCRIPTION: {
      field: "onHoldReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional free-text elaboration on on-hold reason"
    },
  },

  // ── ABORT PROJECT ────────────────────────────────────────────────────
  ABORT_PROJECT: {
    ABORT_REASON_TYPE: {
      field: "abortReasonType",
      required: true,
      validation: validationRules.abortReasonType,
      description: "Reason category for aborting (enum)"
    },
    ABORT_REASON_DESCRIPTION: {
      field: "abortReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional free-text elaboration on abort reason"
    },
  },

  // ── COMPLETE PROJECT (no required body fields – projectId in params) ─
  COMPLETE_PROJECT: {},

  // ── RESUME PROJECT ───────────────────────────────────────────────────
  RESUME_PROJECT: {
    RESUME_REASON_TYPE: {
      field: "resumeReasonType",
      required: true,
      validation: validationRules.resumeReasonType,
      description: "Reason category for resuming (enum)"
    },
    RESUME_REASON_DESCRIPTION: {
      field: "resumeReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional free-text elaboration on resume reason"
    },
  },

  // ── DELETE PROJECT ───────────────────────────────────────────────────
  DELETE_PROJECT: {
    DELETION_REASON_TYPE: {
      field: "deletionReasonType",
      required: true,
      validation: validationRules.deletionReasonType,
      description: "Reason category for deleting (enum)"
    },
    DELETION_REASON_DESCRIPTION: {
      field: "deletionReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional free-text elaboration on deletion reason"
    },
  },

  // ── ARCHIVE PROJECT (no required body fields – projectId in params) ─
  ARCHIVE_PROJECT: {},

  // ── CREATE STAKEHOLDER ────────────────────────────────────────────────
  // NOTE: role-guard middleware handles admin vs client role-type split;
  //       validation middleware only checks userId format and field presence.
  CREATE_STAKEHOLDER: {
    PROJECT_ID: {
      field: "projectId",
      required: true,
      validation: validationRules.mongoId,   // MongoID check handled in service / fetch middleware
      description: "MongoDB ObjectId of the project this stakeholder belongs to"
    },
    USER_ID: {
      field: "userId",
      required: true,
      validation: validationRules.userId,
      description: "USR-prefixed custom user ID of the stakeholder (admin or client)"
    },
    ROLE: {
      field: "role",
      required: true,
      validation: null,   // role-guard middleware enforces admin vs client split
      description: "ProjectRole (admin) or ClientRole (client) — enforced by role-guard"
    },
  },

  // ── UPDATE STAKEHOLDER ────────────────────────────────────────────────
  UPDATE_STAKEHOLDER: {
    ROLE: {
      field: "role",
      required: true,
      validation: null,   // role-guard middleware enforces admin vs client split
      description: "New role to assign — must match the user's entity type"
    },
  },

  // ── DELETE STAKEHOLDER ────────────────────────────────────────────────
  DELETE_STAKEHOLDER: {
    DELETION_REASON_TYPE: {
      field: "deletionReasonType",
      required: true,
      validation: validationRules.stakeholderDeletionReasonType,
      description: "Reason category for deleting the stakeholder (enum)"
    },
    DELETION_REASON_DESCRIPTION: {
      field: "deletionReasonDescription",
      required: false,
      validation: validationRules.reasonDescription,
      description: "Optional free-text elaboration on deletion reason"
    },
  },

};

module.exports = { FieldDefinitions };
