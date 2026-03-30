// services/specifications/delete-specification.service.js

const { ProjectModel } = require("../../models");
const { SpecificationModel } = require("../../models");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const deleteSpecificationService = async ({
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

    // Check specification exists and is not already deleted
    const specification = await SpecificationModel.findOne({
      projectId,
      isDeleted: false,
      isFrozen: false // Ensure we only delete if not frozen
    });
    if (!specification) {
      return {
        success: false,
        message: "Specification not found or already deleted",
        errorCode: NOT_FOUND,
      };
    }

    // Soft delete specification
    specification.isDeleted = true;
    specification.deletedAt = new Date();
    specification.deletedBy = deletedBy;
    specification.deletionReasonType = deletionReasonType;
    specification.deletionReasonDescription = deletionReasonDescription;

    await specification.save();

    // Log activity
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.DELETE_SPECIFICATION,
      `Specification deleted - Reason: ${deletionReasonType}`,
      { adminActions: { targetId: projectId } }
    );

    return {
      success: true,
      message: "Specification deleted successfully",
      specification,
    };
  } catch (error) {
    console.error("[deleteSpecificationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to delete specification",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { deleteSpecificationService };
