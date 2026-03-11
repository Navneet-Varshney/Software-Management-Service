// services/stakeholders/create-stakeholder.service.js

const mongoose = require("mongoose");
const { ProjectModel }     = require("@models/project.model");
const { StakeholderModel } = require("@models/stakeholder.model");
const { InceptionModel }   = require("@models/inception.model");
const { versionControlService } = require("@services/common/version.service");
const { convertOnHoldToActiveProjectService } = require("@services/projects/on-hold-project.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { Phases, ProjectStatus } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Creates a new stakeholder and handles the side-effects:
 *  - Auto-creates InceptionModel document if project is in INCEPTION phase.
 *  - Promotes project status from DRAFT → ACTIVE.
 *  - Bumps the current-phase version via versionControlService.
 *
 * @param {Object} params
 * @param {string} params.projectId       - MongoDB ObjectId string of the project
 * @param {string} params.userId          - USR-prefixed custom ID (becomes stakeholderId)
 * @param {string} params.role            - Validated role (admin or client type)
 * @param {string|null} params.organizationId - MongoDB ObjectId string (clients only, else null)
 * @param {string} params.createdBy       - USR-prefixed custom ID of the acting admin
 * @param {Object} params.auditContext    - { admin, device, requestId }
 * @returns {{ success: boolean, stakeholder?: Object, message?: string, error?: string }}
 */
const createStakeholderService = async ({
  projectId,
  userId,
  role,
  organizationId = null,
  createdBy,
  auditContext,
}) => {
  try {
    // ── Fetch project ─────────────────────────────────────────────────────────
    const project = await ProjectModel.findOne({
      _id: projectId,
      isDeleted: false
    });

    if (!project)       return { success: false, message: "Project not found" };

    const blockedStatuses = [ProjectStatus.COMPLETED, ProjectStatus.ABORTED, ProjectStatus.ARCHIVED];
    if (blockedStatuses.includes(project.projectStatus)) {
      return {
        success: false,
        message: `Cannot add a stakeholder to a ${project.projectStatus} project`,
      };
    }

    // ── Auto-convert ON_HOLD → ACTIVE before proceeding ────────────────────────
    if (project.projectStatus === ProjectStatus.ON_HOLD) {
      const converted = await convertOnHoldToActiveProjectService(project._id.toString(), {
        convertedBy: createdBy,
        auditContext,
      });
      if (!converted.success) {
        return { success: false, message: converted.message };
      }
      logWithTime(`✅ [createStakeholderService] Project ${projectId} auto-converted ON_HOLD → ACTIVE`);
    }

    // ── Guard: prevent duplicate stakeholder ──────────────────────────────────
    const existing = await StakeholderModel.findOne({
      stakeholderId: userId,
      projectId,
      isDeleted: false,
    });
    if (existing) {
      return { success: false, message: "Stakeholder already exists for this project" };
    }

    // ── Create stakeholder ────────────────────────────────────────────────────
    const stakeholderData = {
      stakeholderId:  userId,   // stakeholderId === userId per design
      projectId,
      role,
      createdBy,
      phase: project.currentPhase,
    };
    if (organizationId && mongoose.Types.ObjectId.isValid(organizationId)) {
      stakeholderData.organizationId = organizationId;
    }

    const stakeholder = await StakeholderModel.create(stakeholderData);

    // ── Inception phase side-effects ──────────────────────────────────────────
    let updatedProject = project;

    if (project.currentPhase === Phases.INCEPTION) {
      // 1. Auto-create InceptionModel doc if not yet present
      const inceptionExists = await InceptionModel.findOne({ projectId, isDeleted: false });
      if (!inceptionExists) {
        await InceptionModel.create({
          projectId,
          cycleNumber: 0,
          version:     "v1.0",
          createdBy,
        });
        logWithTime(`[createStakeholderService] InceptionModel auto-created for project ${projectId}`);
      }

      // 2. Promote DRAFT → ACTIVE
      if (project.projectStatus === ProjectStatus.DRAFT) {
        updatedProject = await ProjectModel.findByIdAndUpdate(
          projectId,
          { $set: { projectStatus: ProjectStatus.ACTIVE } },
          { new: true }
        );
        logWithTime(`[createStakeholderService] Project ${projectId} promoted DRAFT → ACTIVE`);
      }
    }

    // ── Version control ───────────────────────────────────────────────────────
    await versionControlService(
      updatedProject,
      `Stakeholder ${userId} added to project — version bump`,
      createdBy,
      auditContext
    );

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { admin, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      admin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.CREATE_STAKEHOLDER,
      `Stakeholder ${userId} (role: ${role}) added to project ${projectId} by ${createdBy}`,
      {
        newData: prepareAuditData(null, stakeholder).newData,
        adminActions: { targetId: stakeholder._id?.toString() },
      }
    );

    return { success: true, stakeholder };

  } catch (error) {
    if (error.name === "ValidationError") {
      return { success: false, message: "Validation error", error: error.message };
    }
    return { success: false, message: "Internal error while creating stakeholder", error: error.message };
  }
};

module.exports = { createStakeholderService };
