// services/elaborations/freeze-elaboration.service.js

const { ProjectModel } = require("../../models");
const { ElaborationModel } = require("../../models");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("../../configs/system-log-events.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

const freezeElaborationService = async ({
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

    // Check elaboration exists and is not already frozen
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

    if (elaboration.isFrozen) {
      return {
        success: false,
        message: "Elaboration is already frozen",
        errorCode: CONFLICT,
      };
    }

    // Freeze elaboration
    elaboration.isFrozen = true;
    elaboration.frozenAt = new Date();
    elaboration.frozenBy = frozenBy;

    await elaboration.save();

    // Log activity
    await logActivityTrackerEvent({
      projectId,
      event: ACTIVITY_TRACKER_EVENTS.FREEZE_ELABORATION,
      createdBy: frozenBy,
      auditContext,
    });

    return {
      success: true,
      message: "Elaboration frozen successfully",
      elaboration,
    };
  } catch (error) {
    console.error("[freezeElaborationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to freeze elaboration",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { freezeElaborationService };
