// services/validations/freeze-validation.service.js

const { ProjectModel } = require("../../models");
const { ValidationModel } = require("../../models");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("../../configs/system-log-events.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

const freezeValidationService = async ({
  projectId,
  frozenBy,
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

    // Check validation exists and is not already frozen
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

    if (validation.isFrozen) {
      return {
        success: false,
        message: "Validation is already frozen",
        errorCode: CONFLICT,
      };
    }

    // Freeze validation
    validation.isFrozen = true;
    validation.frozenAt = new Date();
    validation.frozenBy = frozenBy;

    await validation.save();

    // Log activity
    await logActivityTrackerEvent({
      projectId,
      event: ACTIVITY_TRACKER_EVENTS.FREEZE_VALIDATION,
      createdBy: frozenBy,
      auditContext,
    });

    return {
      success: true,
      message: "Validation frozen successfully",
      validation,
    };
  } catch (error) {
    console.error("[freezeValidationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to freeze validation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { freezeValidationService };
