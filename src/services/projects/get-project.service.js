// services/projects/get-project.service.js

const { ProjectModel } = require("@models/project.model");
const { StakeholderModel } = require("@models/stakeholder.model");

// ─────────────────────────────────────────────────────────────────────────────
// Field projection constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fields a client can see on a single project detail view.
 * Internal audit/reason trails are hidden from clients.
 */
const CLIENT_DETAIL_FIELDS = {
  _id: 1,
  name: 1,
  description: 1,
  problemStatement: 1,
  goal: 1,
  version: 1,
  projectStatus: 1,
  currentPhase: 1,
  createdAt: 1,
  updatedAt: 1,
  completedAt: 1,
};

// ─────────────────────────────────────────────────────────────────────────────
// Service 1: Get single project – Admin view (full details)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {Object} project
 * @returns {{ success: true, project } | { success: false, message }}
 */
const getProjectAdminService = async (project) => {
  try {
    const stakeholders = await StakeholderModel
      .find({ projectId: project._id, isDeleted: false })
      .lean();

    return {
      success: true,
      project: {
        ...(project.toObject ? project.toObject() : project),
        stakeholders,
      },
    };
  } catch (error) {
    return { success: false, message: "Internal error while fetching project", error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Service 2: Get single project – Client view (restricted fields)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {Object} project
 * @param {Object} [requestStakeholder]
 * @returns {{ success: true, project } | { success: false, message }}
 */
const getProjectClientService = async (project, requestStakeholder = null) => {
  try {

    const restrictedProjectDetails = await ProjectModel
      .findById(project._id, CLIENT_DETAIL_FIELDS)
      .lean();

    const safeStakeholder = requestStakeholder
      ? {
        stakeholderId: requestStakeholder.userId,
        role: requestStakeholder.role,
        phase: requestStakeholder.phase,
        joinedAt: requestStakeholder.createdAt,
      }
      : null;

    return {
      success: true,
      project: {
        ...restrictedProjectDetails,
        stakeholder: safeStakeholder,
      },
    };

  } catch (error) {
    return {
      success: false,
      message: "Internal error while fetching project",
      error: error.message
    };
  }
};

module.exports = {
  getProjectAdminService,
  getProjectClientService
};
