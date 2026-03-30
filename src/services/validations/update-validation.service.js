// services/validations/update-validation.service.js

const { ProjectModel } = require("../../models");
const { ValidationModel } = require("../../models");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("../../configs/system-log-events.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

const updateValidationService = async ({
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

    // Check validation exists and is not deleted
    const validation = await ValidationModel.findOne({
      projectId,
      isDeleted: false,
    });
    if (!validation) {
      return {
        success: false,
        message: "Validation not found",
        errorCode: NOT_FOUND,
      };
    }

    // Update validation
    Object.assign(validation, updateData);
    validation.updatedBy = updatedBy;
    validation.updatedAt = new Date();

    await validation.save();

    // Log activity
    await logActivityTrackerEvent({
      projectId,
      event: ACTIVITY_TRACKER_EVENTS.UPDATE_VALIDATION,
      createdBy: updatedBy,
      auditContext,
    });

    return {
      success: true,
      message: "Validation updated successfully",
      validation,
    };
  } catch (error) {
    console.error("[updateValidationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to update validation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { updateValidationService };
