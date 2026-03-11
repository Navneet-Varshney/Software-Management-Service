// services/projects/resume-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { ProjectStatus } = require("@configs/enums.config");

/**
 * Resumes a project that was previously put ON_HOLD or ABORTED.
 *
 * Allowed source statuses : ON_HOLD | ABORTED
 * Blocked if              : isDeleted === true  |  projectStatus === COMPLETED
 *
 * Sets projectStatus → ACTIVE, records resumeReasonType / resumeReasonDescription,
 * and clears abortedAt (since the project is now active again).
 *
 * Version is NOT incremented – resuming is a lifecycle event.
 *
 * @param {string} projectId
 * @param {Object} params
 * @param {string} params.resumeReasonType
 * @param {string} [params.resumeReasonDescription]
 * @param {string} params.resumedBy         - Admin USR ID
 * @param {Object} params.auditContext
 *
 * @returns {{ success: true, project } | { success: false, message, error? }}
 */
const resumeProjectService = async (projectId, params) => {
  try {
    const existing = await ProjectModel.findOne({
      _id: projectId,
      isDeleted: false
    });

    if (!existing) {
      return { success: false, message: "Project not found" };
    }

    // ── Guard: completed projects cannot be resumed ──────────────────
    if (existing.projectStatus === ProjectStatus.COMPLETED) {
      return { success: false, message: "Project is already completed" };
    }

    // ── Guard: must be ON_HOLD or ABORTED ────────────────────────────
    const resumableStatuses = [ProjectStatus.ON_HOLD, ProjectStatus.ABORTED];
    if (!resumableStatuses.includes(existing.projectStatus)) {
      return {
        success: false,
        message: "Only an ON_HOLD or ABORTED project can be resumed",
        currentStatus: existing.projectStatus,
      };
    }

    const updatePayload = {
      projectStatus: ProjectStatus.ACTIVE,
      resumeReasonType: params.resumeReasonType,
      resumeReasonDescription: params.resumeReasonDescription || null,
      updatedBy: params.resumedBy,
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
      ACTIVITY_TRACKER_EVENTS.RESUME_PROJECT,
      `Project '${updatedProject.name}' (${projectId}) resumed by ${params.resumedBy}. Reason: ${params.resumeReasonType}`,
      { oldData, newData, adminActions: { targetId: projectId } }
    );

    return { success: true, project: updatedProject };
  } catch (error) {
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while resuming project", error: error.message };
  }
};

module.exports = { resumeProjectService };
