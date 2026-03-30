// services/specifications/delete-specification.service.js

const { ProjectModel } = require("../../models");
const { SpecificationModel } = require("../../models");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("../../configs/system-log-events.config");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");
const { DELETION_REASON_TYPES } = require("../../configs/enums.config");

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
    specification.deletionReasonType = deletionReasonType || DELETION_REASON_TYPES.OTHER;
    specification.deletionReasonDescription = deletionReasonDescription || "";

    await specification.save();

    // Log activity
    await logActivityTrackerEvent({
      projectId,
      event: ACTIVITY_TRACKER_EVENTS.DELETE_SPECIFICATION,
      createdBy: deletedBy,
      auditContext,
    });

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
