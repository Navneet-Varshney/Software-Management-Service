// services/specifications/create-specification.service.js

const mongoose = require("mongoose");
const { ProjectModel } = require("@models/project.model");
const { SpecificationModel } = require("@models/specification.model");
const { Phases } = require("@configs/enums.config");
const { createPhaseWithVersionManagement } = require("@services/common/phase-management.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { prepareAuditData } = require("@utils/audit-data.util");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT, NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

/**
 * Creates a new specification document in the database.
 *
 * @param {Object} params
 * @param {string} params.projectId              - Project MongoDB ObjectId
 * @param {boolean} [params.allowParallelMeetings] - Allow parallel meetings (default: false)
 * @param {string} params.createdBy              - Admin USR ID
 * @param {Object} params.auditContext           - { user, device, requestId }
 *
 * @returns {{ success: true, specification } | { success: false, message, errorCode }}
 */
const createSpecificationService = async ({
  projectId,
  allowParallelMeetings,
  createdBy,
  auditContext
}) => {
  try {
    // ── Step 1: Verify project exists ──────────────────────────────────
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      logWithTime(`❌ [createSpecificationService] Project not found: ${projectId}`);
      return { success: false, message: "Project not found", errorCode: NOT_FOUND };
    }

    // ── Step 2: Check if specification already exists ───────────────────
    const existingSpecification = await SpecificationModel.findOne({
      projectId,
      isDeleted: false,
      isFrozen: false
    });

    if (existingSpecification) {
      logWithTime(`❌ [createSpecificationService] Specification already exists for project ${projectId}`);
      return { success: false, message: "An active specification already exists for this project", errorCode: CONFLICT };
    }

    // ── Step 3: Update project's currentPhase to SPECIFICATION ─────────
    logWithTime(`[createSpecificationService] Updating project phase to SPECIFICATION for ${projectId}`);
    
    const oldProjectData = { ...project.toObject ? project.toObject() : project };
    
    const updatedProject = await ProjectModel.findByIdAndUpdate(
      projectId,
      {
        currentPhase: Phases.SPECIFICATION
      },
      { new: true }
    );

    if (!updatedProject) {
      logWithTime(`❌ [createSpecificationService] Failed to update project phase`);
      return { success: false, message: "Failed to update project phase", errorCode: INTERNAL_ERROR };
    }

    // Log project update activity
    const { user, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldProjectData, updatedProject);
    logActivityTrackerEvent(
      user, device, requestId, ACTIVITY_TRACKER_EVENTS.UPDATE_PROJECT,
      `Project phase transitioned to SPECIFICATION`,
      { oldData, newData, adminActions: { targetId: projectId } }
    );

    // ── Step 4: Create phase WITH version management AND additional data ─
    logWithTime(`[createSpecificationService] Creating SPECIFICATION phase document`);
    
    const phaseResult = await createPhaseWithVersionManagement({
      project: updatedProject,
      createdBy,
      auditContext,
      additionalData: { 
        allowParallelMeetings: allowParallelMeetings || false
      }
    });

    if (!phaseResult.success) {
      logWithTime(`❌ [createSpecificationService] Failed to create phase: ${phaseResult.message}`);
      
      return {
        success: false,
        message: phaseResult.message,
        errorCode: phaseResult.errorCode || INTERNAL_ERROR
      };
    }

    logWithTime(`✅ [createSpecificationService] Specification created with ID: ${phaseResult.phase._id}`);
    
    return { success: true, specification: phaseResult.phase };

  } catch (error) {
    logWithTime(`❌ [createSpecificationService] Error: ${error.message}`);
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while creating specification", error: error.message };
  }
};

module.exports = { createSpecificationService };
