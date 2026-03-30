// services/validations/delete-validation.service.js

const { ProjectModel } = require("../../models");
const { ValidationModel } = require("../../models");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("../../configs/system-log-events.config");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");
const { DELETION_REASON_TYPES } = require("../../configs/enums.config");

const deleteValidationService = async ({
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

    // Check validation exists and is not already deleted
    const validation = await ValidationModel.findOne({
      projectId,
      isDeleted: false,
    });
    if (!validation) {
      return {
        success: false,
        message: "Validation not found or already deleted",
        errorCode: NOT_FOUND,
      };
    }

    // Soft delete validation
    validation.isDeleted = true;
    validation.deletedAt = new Date();
    validation.deletedBy = deletedBy;
    validation.deletionReasonType = deletionReasonType || DELETION_REASON_TYPES.OTHER;
    validation.deletionReasonDescription = deletionReasonDescription || "";

    await validation.save();

    // Log activity
    await logActivityTrackerEvent({
      projectId,
      event: ACTIVITY_TRACKER_EVENTS.DELETE_VALIDATION,
      createdBy: deletedBy,
      auditContext,
    });

    return {
      success: true,
      message: "Validation deleted successfully",
      validation,
    };
  } catch (error) {
    console.error("[deleteValidationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to delete validation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { deleteValidationService };
