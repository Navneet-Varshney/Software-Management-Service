// services/negotiations/freeze-negotiation.service.js

const { ProjectModel } = require("../../models");
const { NegotiationModel } = require("../../models");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("../../configs/system-log-events.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

const freezeNegotiationService = async ({
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

    // Check negotiation exists and is not already frozen
    const negotiation = await NegotiationModel.findOne({
      projectId,
      isDeleted: false,
    });
    if (!negotiation) {
      return {
        success: false,
        message: "Negotiation not found",
        errorCode: NOT_FOUND,
      };
    }

    if (negotiation.isFrozen) {
      return {
        success: false,
        message: "Negotiation is already frozen",
        errorCode: CONFLICT,
      };
    }

    // Freeze negotiation
    negotiation.isFrozen = true;
    negotiation.frozenAt = new Date();
    negotiation.frozenBy = frozenBy;

    await negotiation.save();

    // Log activity
    await logActivityTrackerEvent({
      projectId,
      event: ACTIVITY_TRACKER_EVENTS.FREEZE_NEGOTIATION,
      createdBy: frozenBy,
      auditContext,
    });

    return {
      success: true,
      message: "Negotiation frozen successfully",
      negotiation,
    };
  } catch (error) {
    console.error("[freezeNegotiationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to freeze negotiation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { freezeNegotiationService };
