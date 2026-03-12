// services/projects/create-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectCategoryTypes } = require("@configs/enums.config");
const { isValidMongoID } = require("@/utils/id-validators.util");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Creates a new project document in the database.
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.description
 * @param {string} params.problemStatement
 * @param {string} params.goal
 * @param {string} params.projectCategory          - Required. One of: individual | organization | multi_organization
 * @param {string[]} [params.orgIds]               - organization: array of exactly 1 MongoID | multi_organization: array min 1
 * @param {number} [params.expectedBudget]       - Optional
 * @param {number} [params.expectedTimelineMonths] - Optional
 * @param {string} params.createdBy
 * @param {string} params.projectCreationReasonType
 * @param {string} [params.projectCreationReasonDescription]
 * @param {Object} params.auditContext
 *
 * @returns {Object} { success: true, project } | { success: false, message, error? }
 */
const createProjectService = async ({
  name,
  description,
  problemStatement,
  goal,
  projectCategory,
  orgIds,
  expectedBudget,
  expectedTimelineMonths,
  createdBy,
  projectCreationReasonType,
  projectCreationReasonDescription,
  auditContext
}) => {
  try {
    // ── Validate projectCategory (required) ─────────────────────────
    if (!projectCategory) {
      return { success: false, message: "projectCategory is required" };
    }
    if (!Object.values(ProjectCategoryTypes).includes(projectCategory)) {
      return { success: false, message: `projectCategory must be one of: ${Object.values(ProjectCategoryTypes).join(", ")}` };
    }

    // ── Resolve orgIds from category-specific inputs ─────────────────
    let resolvedOrgIds = [];

    if (projectCategory === ProjectCategoryTypes.INDIVIDUAL) {
      // No org association — force empty regardless of any supplied input
      resolvedOrgIds = [];

    } else if (projectCategory === ProjectCategoryTypes.ORGANIZATION) {
      if (!Array.isArray(orgIds) || orgIds.length !== 1) {
        return { success: false, message: "orgIds must be an array with exactly one entry for an organization project" };
      }
      if (!isValidMongoID(orgIds[0])) {
        return { success: false, message: "orgIds[0] must be a valid MongoDB ObjectId string" };
      }
      resolvedOrgIds = [orgIds[0].toString()];

    } else if (projectCategory === ProjectCategoryTypes.MULTI_ORGANIZATION) {
      if (!Array.isArray(orgIds) || orgIds.length < 1) {
        return { success: false, message: "orgIds array with at least one entry is required for a multi-organization project" };
      }
      if (!orgIds.every(id => isValidMongoID(id))) {
        return { success: false, message: "Every entry in orgIds must be a valid MongoDB ObjectId string" };
      }
      resolvedOrgIds = [...new Set(orgIds.map(id => id.toString()))];
    }

    // ── Persist ───────────────────────────────────────────────────────
    const project = await ProjectModel.create({
      name,
      description,
      problemStatement,
      goal,
      projectCategory,
      orgIds: resolvedOrgIds,
      ...(expectedBudget !== undefined && { expectedBudget }),
      ...(expectedTimelineMonths !== undefined && { expectedTimelineMonths }),
      createdBy,
      projectCreationReasonType,
      projectCreationReasonDescription: projectCreationReasonDescription || null,
    });

    // ── Fire-and-forget: activity tracking ──────────────────────────
    const { admin, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      admin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.CREATE_PROJECT,
      `Project '${project.name}' (${project._id}) created by ${createdBy}`,
      { newData: project }
    );

    return { success: true, project };
  } catch (error) {
    if (error.name === "ValidationError") {
      logWithTime(`❌ [createProjectService] ValidationError: ${error.message}`);
      return {
        success: false,
        message: "Validation error",
        error: error.message,
      };
    }

    logWithTime(`❌ [createProjectService] Unexpected error [${error.name}]: ${error.message}`);
    return {
      success: false,
      message: "Internal error while creating project",
      error: error.message,
    };
  }
};

module.exports = { createProjectService };

