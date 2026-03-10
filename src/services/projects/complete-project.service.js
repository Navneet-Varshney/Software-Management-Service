// services/projects/complete-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectStatus } = require("@configs/enums.config");

/**
 * Marks a project as COMPLETED.
 *
 * Allowed source statuses : ACTIVE
 * Blocked if              : isDeleted === true  |  projectStatus === COMPLETED
 *
 * Sets projectStatus → COMPLETED and completedAt (the pre-save hook also
 * auto-sets completedAt, so it is doubly guaranteed).
 *
 * Version is NOT incremented – completing is a lifecycle event.
 *
 * @param {string} projectId
 * @param {Object} params
 * @param {string} params.completedBy   - Admin USR ID
 * @param {Object} params.auditContext
 *
 * @returns {{ success: true, project } | { success: false, message, error? }}
 */
const completeProjectService = async (projectId, params) => {
  try {
    const existing = await ProjectModel.findById(projectId);

    if (!existing) {
      return { success: false, message: "Project not found" };
    }

    // ── Guard: soft-deleted ──────────────────────────────────────────
    if (existing.isDeleted) {
      return { success: false, message: "Project is deleted" };
    }

    // ── Guard: already completed ─────────────────────────────────────
    if (existing.projectStatus === ProjectStatus.COMPLETED) {
      return { success: false, message: "Project is already completed" };
    }

    // ── Guard: must be ACTIVE to complete ────────────────────────────
    if (existing.projectStatus !== ProjectStatus.ACTIVE) {
      return {
        success: false,
        message: "Only an ACTIVE project can be completed",
        currentStatus: existing.projectStatus,
      };
    }

    const updatePayload = {
      projectStatus: ProjectStatus.COMPLETED,
      completedAt: new Date(),
      updatedBy: params.completedBy,
    };

    const updatedProject = await ProjectModel.findByIdAndUpdate(
      projectId,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    // ── Fire-and-forget: activity tracking ──────────────────────────
    const { admin, device, requestId } = params.auditContext || {};
    const { oldData, newData } = prepareAuditData(existing, updatedProject);

    logActivityTrackerEvent(
      admin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.COMPLETE_PROJECT,
      `Project '${updatedProject.name}' (${projectId}) marked as completed by ${params.completedBy}`,
      { oldData, newData, adminActions: { targetId: projectId } }
    );

    return { success: true, project: updatedProject };
  } catch (error) {
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while completing project", error: error.message };
  }
};

module.exports = { completeProjectService };
