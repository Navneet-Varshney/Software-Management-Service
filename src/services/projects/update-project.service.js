// services/projects/update-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { generateVersion } = require("@/utils/version.util");
const { ProjectStatus, ProjectCategoryTypes } = require("@/configs/enums.config");
const { isValidMongoID } = require("@/utils/id-validators.util");

/**
 * Updates the core content fields of an existing project.
 *
 * Blocked if: project is soft-deleted OR projectStatus === COMPLETED.
 * Only name / description / problemStatement / goal are writable here.
 * Status lifecycle changes have their own dedicated services.
 *
 * Version is incremented only when at least one field value actually changes.
 *
 * @param {string} projectId
 * @param {Object} updates
 * @param {string} [updates.name]
 * @param {string} [updates.description]
 * @param {string} [updates.problemStatement]
 * @param {string} [updates.goal]
 * @param {number} [updates.expectedBudget]
 * @param {number} [updates.expectedTimelineMonths]
 * @param {string[]} [updates.addedOrgIds]           - MULTI_ORGANIZATION only: org IDs to add
 * @param {string[]} [updates.removedOrgIds]         - MULTI_ORGANIZATION only: org IDs to remove
 * @param {string} [updates.orgId]                  - ORGANIZATION only: replace single orgId
 * @param {string} updates.updatedBy
 * @param {string} updates.projectUpdationReasonType
 * @param {string} [updates.projectUpdationReasonDescription]
 * @param {Object} updates.auditContext
 *
 * @returns {{ success: true, oldProject, project } | { success: false, message, error? }}
 */
const updateProjectService = async (projectId, updates) => {
  try {
    // 1. Fetch current document (needed for audit + version increment)
    const existing = await ProjectModel.findOne({
      _id: projectId,
      isDeleted: false
    });

    if (!existing) {
      return { success: false, message: "Project not found" };
    }

    const blockedStatuses = [ProjectStatus.COMPLETED, ProjectStatus.ABORTED, ProjectStatus.ARCHIVED];
    if (blockedStatuses.includes(existing.projectStatus)) {
      return {
        success: false,
        message: `Cannot update a ${existing.projectStatus} project`,
      };
    }

    // 2. Build update payload — only include supplied fields
    const allowedFields = ["name", "description", "problemStatement", "goal", "expectedBudget", "expectedTimelineMonths"];
    const updatePayload = {};

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updatePayload[field] = updates[field];
      }
    });

    // 2b. Org IDs management based on project category
    let hasOrgChanges = false;

    if (existing.projectCategory === ProjectCategoryTypes.INDIVIDUAL) {
      // Individual projects never have orgIds — silently clear if somehow polluted
      if (existing.orgIds && existing.orgIds.length > 0) {
        updatePayload.orgIds = [];
        hasOrgChanges = true;
      }

    } else if (existing.projectCategory === ProjectCategoryTypes.ORGANIZATION) {
      // Allow replacing the single orgId
      if (updates.orgId !== undefined) {
        if (!isValidMongoID(updates.orgId)) {
          return { success: false, message: "orgId must be a valid MongoDB ObjectId string" };
        }
        updatePayload.orgIds = [updates.orgId.toString()];
        hasOrgChanges = existing.orgIds?.[0] !== updates.orgId.toString();
      }

    } else if (existing.projectCategory === ProjectCategoryTypes.MULTI_ORGANIZATION) {
      const hasAdded   = Array.isArray(updates.addedOrgIds)   && updates.addedOrgIds.length > 0;
      const hasRemoved = Array.isArray(updates.removedOrgIds) && updates.removedOrgIds.length > 0;

      if (hasAdded || hasRemoved) {
        const addedOrgIds   = (updates.addedOrgIds   || []).map(id => id.toString());
        const removedOrgIds = (updates.removedOrgIds || []).map(id => id.toString());

        // Validate all supplied IDs
        const allSupplied = [...addedOrgIds, ...removedOrgIds];
        if (!allSupplied.every(id => isValidMongoID(id))) {
          return { success: false, message: "All org IDs must be valid MongoDB ObjectId strings" };
        }

        const currentSet = new Set(existing.orgIds.map(id => id.toString()));
        addedOrgIds.forEach(id => currentSet.add(id));
        removedOrgIds.forEach(id => currentSet.delete(id));

        if (currentSet.size < 1) {
          return { success: false, message: "A multi-organization project must retain at least one organisation" };
        }

        updatePayload.orgIds = [...currentSet];
        hasOrgChanges = true;
      }
    }

    // 2a. Bail out early if none of the supplied values actually differ
    const hasActualChanges = hasOrgChanges || allowedFields.some((field) => {
      if (updatePayload[field] === undefined) return false;
      return updatePayload[field] !== existing[field];
    });

    if (!hasActualChanges) {
      return { success: true, message: "No changes detected, Project Document remains unchanged" };
    }

    // 3. Increment version only when something genuinely changed
    updatePayload.version = generateVersion(1, existing.version);

    // 4. Stamp updatedBy and updation reason
    updatePayload.updatedBy = updates.updatedBy;
    updatePayload.projectUpdationReasonType = updates.projectUpdationReasonType;
    updatePayload.projectUpdationReasonDescription = updates.projectUpdationReasonDescription || null;

    // 5. Persist – { new: true } returns the updated document
    const updatedProject = await ProjectModel.findByIdAndUpdate(
      projectId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    // ── Fire-and-forget: activity tracking ──────────────────────────
    const { admin, device, requestId } = updates.auditContext || {};
    const { oldData, newData } = prepareAuditData(existing, updatedProject);

    logActivityTrackerEvent(
      admin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UPDATE_PROJECT,
      `Project '${updatedProject.name}' (${projectId}) updated to ${updatedProject.version} by ${updates.updatedBy}`,
      {
        oldData,
        newData,
        adminActions: { targetId: projectId },
      }
    );

    return {
      success: true,
      oldProject: existing,
      project: updatedProject,
    };
  } catch (error) {
    if (error.name === "ValidationError") {
      return {
        success: false,
        message: "Validation error",
        error: error.message,
      };
    }

    return {
      success: false,
      message: "Internal error while updating project",
      error: error.message,
    };
  }
};

module.exports = { updateProjectService };
