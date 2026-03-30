// services/specifications/update-specification.service.js

const { ProjectModel } = require("../../models");
const { SpecificationModel } = require("../../models");
const {
  logActivityTrackerEvent,
} = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("../../configs/system-log-events.config");
const { NOT_FOUND, CONFLICT, INTERNAL_ERROR } = require("@configs/http-status.config");

const updateSpecificationService = async ({
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

    // Check specification exists and is not deleted
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

    // Update specification
    Object.assign(specification, updateData);
    specification.updatedBy = updatedBy;
    specification.updatedAt = new Date();

    await specification.save();

    // Log activity
    await logActivityTrackerEvent({
      projectId,
      event: ACTIVITY_TRACKER_EVENTS.UPDATE_SPECIFICATION,
      createdBy: updatedBy,
      auditContext,
    });

    return {
      success: true,
      message: "Specification updated successfully",
      specification,
    };
  } catch (error) {
    console.error("[updateSpecificationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to update specification",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { updateSpecificationService };
