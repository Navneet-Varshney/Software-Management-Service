// services/elaborations/update-elaboration.service.js

const { ProjectModel } = require("../../models");
const { ElaborationModel } = require("../../models");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("../../configs/system-log-events.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

const updateElaborationService = async ({
  projectId,
  updateData,
  updatedBy,
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

    // Check elaboration exists and is not deleted
    const elaboration = await ElaborationModel.findOne({
      projectId,
      isDeleted: false,
    });
    if (!elaboration) {
      return {
        success: false,
        message: "Elaboration not found",
        errorCode: NOT_FOUND,
      };
    }

    // Update elaboration
    Object.assign(elaboration, updateData);
    elaboration.updatedBy = updatedBy;
    elaboration.updatedAt = new Date();

    await elaboration.save();

    // Log activity
    await logActivityTrackerEvent({
      projectId,
      event: ACTIVITY_TRACKER_EVENTS.UPDATE_ELABORATION,
      createdBy: updatedBy,
      auditContext,
    });

    return {
      success: true,
      message: "Elaboration updated successfully",
      elaboration,
    };
  } catch (error) {
    console.error("[updateElaborationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to update elaboration",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { updateElaborationService };
