// services/projects/get-project.service.js

const { ProjectModel } = require("@models/project.model");

// ─────────────────────────────────────────────────────────────────────────────
// Field projection constants
// ─────────────────────────────────────────────────────────────────────────────

/**
 * All fields an admin can see on a single project detail view.
 * (Everything except Mongoose internals.)
 */
const ADMIN_DETAIL_FIELDS = null; // null = no projection = all fields

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
// Helper: build a Mongoose query filter from flexible list params
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Builds a MongoDB filter object from optional list query parameters.
 *
 * @param {Object} filters
 * @param {string[]}  [filters.projectIds]     - specific _id values to include
 * @param {string}    [filters.projectStatus]  - single status filter
 * @param {string}    [filters.currentPhase]   - single phase filter
 * @param {boolean}   [filters.isArchived]     - include archived
 * @param {string}    [filters.createdBy]      - admin USR ID who created
 * @param {string}    [filters.search]         - partial name search (case-insensitive)
 * @param {boolean}   [filters.includeDeleted] - include soft-deleted (admin only)
 *
 * @returns {Object} Mongoose-compatible filter
 */
const buildListFilter = (filters = {}) => {
  const query = {};

  // Soft-delete: clients never see deleted; admins opt-in
  if (!filters.includeDeleted) {
    query.isDeleted = false;
  }

  if (filters.projectIds && filters.projectIds.length > 0) {
    query._id = { $in: filters.projectIds };
  }

  if (filters.projectStatus) {
    query.projectStatus = filters.projectStatus;
  }

  if (filters.currentPhase) {
    query.currentPhase = filters.currentPhase;
  }

  if (typeof filters.isArchived === "boolean") {
    query.isArchived = filters.isArchived;
  }

  if (filters.createdBy) {
    query.createdBy = filters.createdBy;
  }

  if (filters.search) {
    query.name = { $regex: filters.search, $options: "i" };
  }

  return query;
};

// ─────────────────────────────────────────────────────────────────────────────
// Service 1: Get single project – Admin view (full details)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} projectId
 * @returns {{ success: true, project } | { success: false, message }}
 */
const getProjectAdminService = async (projectId) => {
  try {
    const project = await ProjectModel.findById(projectId, ADMIN_DETAIL_FIELDS).lean();

    if (!project) {
      return { success: false, message: "Project not found" };
    }

    return { success: true, project };
  } catch (error) {
    return { success: false, message: "Internal error while fetching project", error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Service 2: Get single project – Client view (restricted fields)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} projectId
 * @returns {{ success: true, project } | { success: false, message }}
 */
const getProjectClientService = async (projectId) => {
  try {
    const project = await ProjectModel.findById(projectId, CLIENT_DETAIL_FIELDS).lean();

    if (!project) {
      return { success: false, message: "Project not found" };
    }

    // Clients must not see deleted or non-public statuses — guard at service level too
    if (project.isDeleted) {
      return { success: false, message: "Project not found" };
    }

    return { success: true, project };
  } catch (error) {
    return { success: false, message: "Internal error while fetching project", error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Service 3: Get project list – Admin view (flexible filters, full fields)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {Object} filters  - see buildListFilter
 * @param {Object} pagination
 * @param {number} pagination.page   - 1-based
 * @param {number} pagination.limit
 * @param {string[]} [selectFields]  - optional field whitelist
 *
 * @returns {{ success: true, projects, total, page, totalPages } | { success: false, message }}
 */
const listProjectsAdminService = async (filters = {}, pagination = {}) => {
  try {
    const { page = 1, limit = 20, selectFields } = pagination;
    const skip = (page - 1) * limit;

    const query = buildListFilter({ ...filters, includeDeleted: filters.includeDeleted || false });
    const projection = selectFields && selectFields.length > 0
      ? selectFields.reduce((acc, f) => { acc[f] = 1; return acc; }, {})
      : ADMIN_DETAIL_FIELDS;

    const [projects, total] = await Promise.all([
      ProjectModel.find(query, projection).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ProjectModel.countDocuments(query),
    ]);

    return {
      success: true,
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    return { success: false, message: "Internal error while listing projects", error: error.message };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Service 4: Get project list – Client view (restricted fields + no deleted)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {Object} filters  - see buildListFilter (includeDeleted always false)
 * @param {Object} pagination
 * @param {number} pagination.page
 * @param {number} pagination.limit
 * @param {string[]} [selectFields]  - must be a subset of CLIENT_DETAIL_FIELDS keys
 *
 * @returns {{ success: true, projects, total, page, totalPages } | { success: false, message }}
 */
const listProjectsClientService = async (filters = {}, pagination = {}) => {
  try {
    const { page = 1, limit = 20, selectFields } = pagination;
    const skip = (page - 1) * limit;

    // Clients never see deleted projects, ever
    const query = buildListFilter({ ...filters, includeDeleted: false });

    // If caller requests specific fields, intersect with CLIENT_DETAIL_FIELDS whitelist
    let projection = CLIENT_DETAIL_FIELDS;
    if (selectFields && selectFields.length > 0) {
      const allowed = Object.keys(CLIENT_DETAIL_FIELDS);
      const safe = selectFields.filter((f) => allowed.includes(f));
      projection = safe.length > 0
        ? safe.reduce((acc, f) => { acc[f] = 1; return acc; }, {})
        : CLIENT_DETAIL_FIELDS;
    }

    const [projects, total] = await Promise.all([
      ProjectModel.find(query, projection).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ProjectModel.countDocuments(query),
    ]);

    return {
      success: true,
      projects,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    return { success: false, message: "Internal error while listing projects", error: error.message };
  }
};

module.exports = {
  getProjectAdminService,
  getProjectClientService,
  listProjectsAdminService,
  listProjectsClientService,
};
