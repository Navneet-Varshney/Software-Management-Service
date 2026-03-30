// services/elaborations/delete-elaboration.service.js

const { ProjectModel } = require("../../models");
const { ElaborationModel } = require("../../models");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("../../configs/system-log-events.config");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");
const { DELETION_REASON_TYPES } = require("../../configs/enums.config");

const deleteElaborationService = async ({
  projectId,
  deletionReasonType,
  deletionReasonDescription,
  deletedBy,
  auditContext,
}) => {
  try {
    // Check project exists
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return {
        success: false,
        message: "Project not found",
        errorCode: NOT_FOUND,
      };
    }

    // Check elaboration exists and is not already deleted
    const elaboration = await ElaborationModel.findOne({
      projectId,
      isDeleted: false,
    });
    if (!elaboration) {
      return {
        success: false,
        message: "Elaboration not found or already deleted",
        errorCode: NOT_FOUND,
      };
    }

    // Soft delete elaboration
    elaboration.isDeleted = true;
    elaboration.deletedAt = new Date();
    elaboration.deletedBy = deletedBy;
    elaboration.deletionReasonType = deletionReasonType || DELETION_REASON_TYPES.OTHER;
    elaboration.deletionReasonDescription = deletionReasonDescription || "";

    await elaboration.save();

    // Log activity
    await logActivityTrackerEvent({
      projectId,
      event: ACTIVITY_TRACKER_EVENTS.DELETE_ELABORATION,
      createdBy: deletedBy,
      auditContext,
    });

    return {
      success: true,
      message: "Elaboration deleted successfully",
      elaboration,
    };
  } catch (error) {
    console.error("[deleteElaborationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to delete elaboration",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { deleteElaborationService };
