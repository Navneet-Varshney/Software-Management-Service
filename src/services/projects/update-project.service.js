// services/projects/update-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");

/**
 * Increments the minor version segment of a version string.
 *   "v1.0" → "v1.1"  |  "v1.9" → "v1.10"
 *
 * @param {string} currentVersion - e.g. "v1.0"
 * @returns {string} next version string
 */
const incrementVersion = (currentVersion) => {
  const match = currentVersion.match(/^v(\d+)\.(\d+)$/);
  if (!match) return currentVersion; // Should not happen; keep as-is if format breaks

  const major = parseInt(match[1], 10);
  const minor = parseInt(match[2], 10) + 1;
  return `v${major}.${minor}`;
};

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
 * @param {string} updates.updatedBy                    - Admin USR ID
 * @param {string} updates.projectUpdationReasonType    - enum value (required)
 * @param {string} [updates.projectUpdationReasonDescription]
 * @param {Object} updates.auditContext
 *
 * @returns {{ success: true, oldProject, project } | { success: false, message, error? }}
 */
const updateProjectService = async (projectId, updates) => {
  try {
    // 1. Fetch current document (needed for audit + version increment)
    const existing = await ProjectModel.findById(projectId);

    if (!existing) {
      return { success: false, message: "Project not found" };
    }

    // ── Guard: soft-deleted ──────────────────────────────────────────
    if (existing.isDeleted) {
      return { success: false, message: "Project is deleted" };
    }

    // ── Guard: completed (nothing can be done after completion) ─────
    if (existing.projectStatus === "COMPLETED") {
      return { success: false, message: "Project is already completed" };
    }
    // 2. Build update payload — only include supplied fields
    const allowedFields = ["name", "description", "problemStatement", "goal"];
    const updatePayload = {};

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updatePayload[field] = updates[field];
      }
    });

    // 2a. Bail out early if none of the supplied values actually differ
    const hasActualChanges = allowedFields.some((field) => {
      if (updatePayload[field] === undefined) return false;
      return updatePayload[field] !== existing[field];
    });

    if (!hasActualChanges) {
      return { success: false, message: "No changes detected" };
    }

    // 3. Increment version only when something genuinely changed
    updatePayload.version = incrementVersion(existing.version);

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
