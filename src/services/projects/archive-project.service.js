// services/projects/archive-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectStatus } = require("@configs/enums.config");

/**
 * Archives a COMPLETED project.
 *
 * Allowed source status : COMPLETED only
 * Blocked if            : isDeleted === true  |  isArchived === true  |  status !== COMPLETED
 *
 * Sets projectStatus → ARCHIVED, stamps archivedAt / archivedBy.
 * An ARCHIVED project can later be soft-deleted (delete-project service allows it).
 *
 * Version is NOT incremented – archiving is a lifecycle event.
 *
 * @param {string} projectId
 * @param {Object} params
 * @param {string} params.archivedBy    - Admin USR ID
 * @param {Object} params.auditContext
 *
 * @returns {{ success: true, project } | { success: false, message, error? }}
 */
const archiveProjectService = async (projectId, params) => {
  try {
    const existing = await ProjectModel.findById(projectId);

    if (!existing) {
      return { success: false, message: "Project not found" };
    }

    // ── Guard: soft-deleted ──────────────────────────────────────────
    if (existing.isDeleted) {
      return { success: false, message: "Project is deleted" };
    }

    // ── Guard: already archived ──────────────────────────────────────
    if (existing.isArchived) {
      return { success: false, message: "Project is already archived" };
    }

    // ── Guard: only COMPLETED projects can be archived ───────────────
    if (existing.projectStatus !== ProjectStatus.COMPLETED) {
      return {
        success: false,
        message: "Only a COMPLETED project can be archived",
        currentStatus: existing.projectStatus,
      };
    }

    const updatePayload = {
      projectStatus: ProjectStatus.ARCHIVED,
      isArchived: true,
      archivedAt: new Date(),
      archivedBy: params.archivedBy,
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
      ACTIVITY_TRACKER_EVENTS.ARCHIVE_PROJECT,
      `Project '${updatedProject.name}' (${projectId}) archived by ${params.archivedBy}`,
      { oldData, newData, adminActions: { targetId: projectId } }
    );

    return { success: true, project: updatedProject };
  } catch (error) {
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while archiving project", error: error.message };
  }
};

module.exports = { archiveProjectService };
