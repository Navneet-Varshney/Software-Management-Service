// services/negotiations/update-negotiation.service.js

const { ProjectModel } = require("../../models");
const { NegotiationModel } = require("../../models");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("../../configs/system-log-events.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

const updateNegotiationService = async ({
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

    // Check negotiation exists and is not deleted
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

    // Update negotiation
    Object.assign(negotiation, updateData);
    negotiation.updatedBy = updatedBy;
    negotiation.updatedAt = new Date();

    await negotiation.save();

    // Log activity
    await logActivityTrackerEvent({
      projectId,
      event: ACTIVITY_TRACKER_EVENTS.UPDATE_NEGOTIATION,
      createdBy: updatedBy,
      auditContext,
    });

    return {
      success: true,
      message: "Negotiation updated successfully",
      negotiation,
    };
  } catch (error) {
    console.error("[updateNegotiationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to update negotiation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { updateNegotiationService };
