// services/stakeholders/get-stakeholders.service.js

const mongoose = require("mongoose");
const { StakeholderModel } = require("@models/stakeholder.model");

/**
 * Lists stakeholders with optional filters and pagination.
 *
 * @param {Object} filters
 * @param {string} [filters.projectId]        - Filter by project (MongoDB ObjectId string)
 * @param {string} [filters.role]             - Filter by role
 * @param {string} [filters.stakeholderId]    - Filter by custom stakeholderId (USR…)
 * @param {boolean} [filters.includeDeleted]  - Include soft-deleted records (default: false)
 * @param {Object} pagination
 * @param {number} [pagination.page]  - 1-based page number (default: 1)
 * @param {number} [pagination.limit] - Records per page (default: 20, max: 100)
 * @returns {{ success: boolean, stakeholders?: Array, total?: number, page?: number, totalPages?: number, message?: string }}
 */
const getStakeholdersService = async (filters = {}, pagination = {}) => {
  try {
    const { projectId, role, stakeholderId, includeDeleted = false } = filters;

    const query = {};

    if (!includeDeleted) query.isDeleted = false;

    if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
      query.projectId = projectId;
    }

    if (role) query.role = role;

    if (stakeholderId) query.stakeholderId = stakeholderId;

    const page  = Math.max(1, parseInt(pagination.page, 10)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(pagination.limit, 10) || 20));
    const skip  = (page - 1) * limit;

    const [stakeholders, total] = await Promise.all([
      StakeholderModel.find(query).skip(skip).limit(limit).lean(),
      StakeholderModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limit);

    return { success: true, stakeholders, total, page, totalPages };

  } catch (error) {
    return { success: false, message: "Internal error while fetching stakeholders", error: error.message };
  }
};

module.exports = { getStakeholdersService };
