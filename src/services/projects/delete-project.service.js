// services/projects/delete-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectStatus } = require("@configs/enums.config");

/**
 * Soft-deletes a project (sets isDeleted = true).
 *
 * Delete can happen ONLY ONCE — blocked if isDeleted is already true.
 * Also blocked if projectStatus === COMPLETED (nothing can be done after completion).
 *
 * After deletion, no further operations (update / abort / complete / resume)
 * are permitted on the project.
 *
 * @param {string} projectId
 * @param {Object} params
 * @param {string} params.deletionReasonType
 * @param {string} [params.deletionReasonDescription]
 * @param {string} params.deletedBy         - Admin USR ID
 * @param {Object} params.auditContext
 *
 * @returns {{ success: true } | { success: false, message, error? }}
 */
const deleteProjectService = async (projectId, params) => {
  try {
    const existing = await ProjectModel.findById(projectId);

    if (!existing) {
      return { success: false, message: "Project not found" };
    }

    // ── Guard: already deleted (delete only once) ────────────────────
    if (existing.isDeleted) {
      return { success: false, message: "Project is already deleted" };
    }

    // ── Guard: ACTIVE projects cannot be deleted ────────────────
    if (existing.projectStatus === ProjectStatus.ACTIVE) {
      return { success: false, message: "Project is currently active" };
    }

    // ── Guard: COMPLETED projects cannot be deleted ──────────────
    if (existing.projectStatus === ProjectStatus.COMPLETED) {
      return { success: false, message: "Project is already completed" };
    }

    // ARCHIVED projects CAN be deleted

    const updatePayload = {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: params.deletedBy,
      deletionReasonType: params.deletionReasonType,
      deletionReasonDescription: params.deletionReasonDescription || null,
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
      ACTIVITY_TRACKER_EVENTS.DELETE_PROJECT,
      `Project '${existing.name}' (${projectId}) soft-deleted by ${params.deletedBy}. Reason: ${params.deletionReasonType}`,
      { oldData, newData, adminActions: { targetId: projectId } }
    );

    return { success: true };
  } catch (error) {
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while deleting project", error: error.message };
  }
};

module.exports = { deleteProjectService };
