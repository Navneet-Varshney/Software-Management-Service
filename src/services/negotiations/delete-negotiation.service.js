// services/negotiations/delete-negotiation.service.js

const { ProjectModel } = require("../../models");
const { NegotiationModel } = require("../../models");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("../../configs/system-log-events.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");
const { DELETION_REASON_TYPES } = require("../../configs/enums.config");

const deleteNegotiationService = async ({
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

    // Check negotiation exists and is not already deleted
    const negotiation = await NegotiationModel.findOne({
      projectId,
      isDeleted: false,
    });
    if (!negotiation) {
      return {
        success: false,
        message: "Negotiation not found or already deleted",
        errorCode: NOT_FOUND,
      };
    }

    // Soft delete negotiation
    negotiation.isDeleted = true;
    negotiation.deletedAt = new Date();
    negotiation.deletedBy = deletedBy;
    negotiation.deletionReasonType = deletionReasonType || DELETION_REASON_TYPES.OTHER;
    negotiation.deletionReasonDescription = deletionReasonDescription || "";

    await negotiation.save();

    // Log activity
    await logActivityTrackerEvent({
      projectId,
      event: ACTIVITY_TRACKER_EVENTS.DELETE_NEGOTIATION,
      createdBy: deletedBy,
      auditContext,
    });

    return {
      success: true,
      message: "Negotiation deleted successfully",
      negotiation,
    };
  } catch (error) {
    console.error("[deleteNegotiationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to delete negotiation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { deleteNegotiationService };
