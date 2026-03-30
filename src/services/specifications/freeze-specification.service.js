// services/specifications/freeze-specification.service.js

const { ProjectModel } = require("../../models");
const { SpecificationModel } = require("../../models");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

const freezeSpecificationService = async ({
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

    // Check specification exists and is not already frozen
    const specification = await SpecificationModel.findOne({
      projectId,
      isDeleted: false,
    });
    if (!specification) {
      return {
        success: false,
        message: "Specification not found",
        errorCode: NOT_FOUND,
      };
    }

    if (specification.isFrozen) {
      return {
        success: false,
        message: "Specification is already frozen",
        errorCode: CONFLICT,
      };
    }

    // Freeze specification
    specification.isFrozen = true;
    specification.frozenAt = new Date();
    specification.frozenBy = frozenBy;

    await specification.save();

    // Log activity
    const { user, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.FREEZE_SPECIFICATION,
      `Specification frozen - version ${specification.version.major}.${specification.version.minor}`,
      { adminActions: { targetId: projectId } }
    );

    return {
      success: true,
      message: "Specification frozen successfully",
      specification,
    };
  } catch (error) {
    console.error("[freezeSpecificationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to freeze specification",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { freezeSpecificationService };
