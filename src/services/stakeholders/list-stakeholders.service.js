// services/stakeholders/get-stakeholders.service.js

const mongoose = require("mongoose");
const { StakeholderModel } = require("@models/stakeholder.model");

const parsePagination = (pagination = {}) => {
  const page = Math.max(1, parseInt(pagination.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(pagination.limit, 10) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildStakeholderQuery = (filters = {}, forceUserId = null, forceIncludeDeleted = null) => {
  const {
    projectId,
    role,
    stakeholderId,
    includeDeleted = false,
  } = filters;

  const query = {};

  const includeDeletedResolved = forceIncludeDeleted === null ? includeDeleted : forceIncludeDeleted;
  if (!includeDeletedResolved) {
    query.isDeleted = false;
  }

  if (projectId && mongoose.Types.ObjectId.isValid(projectId)) {
    query.projectId = projectId;
  }

  if (role) {
    query.role = role;
  }

  if (stakeholderId) {
    query.userId = stakeholderId;
  }

  if (forceUserId) {
    query.userId = forceUserId;
  }

  return query;
};

/**
 * Admin/full stakeholder list.
 */
const listStakeholdersAdminService = async (filters = {}, pagination = {}) => {
  try {
    const query = buildStakeholderQuery(filters);
    const { page, limit, skip } = parsePagination(pagination);

    const [stakeholders, total] = await Promise.all([
      StakeholderModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      StakeholderModel.countDocuments(query),
    ]);

    return {
      success: true,
      stakeholders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    return { success: false, message: "Internal error while fetching stakeholders", error: error.message };
  }
};

/**
 * Restricted stakeholder list for stakeholder/member access.
 */
const listStakeholdersClientService = async (filters = {}, pagination = {}, requesterUserId = null) => {
  try {
    if (!requesterUserId) {
      return { success: false, message: "Requester userId is required for restricted stakeholder list" };
    }

    const query = buildStakeholderQuery(filters, requesterUserId, false);
    const { page, limit, skip } = parsePagination(pagination);

    const projection = {
      userId: 1,
      role: 1,
      phase: 1,
      createdAt: 1,
      projectId: 1,
      _id: 0,
    };

    const [stakeholders, total] = await Promise.all([
      StakeholderModel.find(query, projection).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      StakeholderModel.countDocuments(query),
    ]);

    const restrictedStakeholders = stakeholders.map((stakeholder) => ({
      stakeholderId: stakeholder.userId,
      role: stakeholder.role,
      phase: stakeholder.phase,
      joinedAt: stakeholder.createdAt,
      projectId: stakeholder.projectId,
    }));

    return {
      success: true,
      stakeholders: restrictedStakeholders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  } catch (error) {
    return { success: false, message: "Internal error while fetching stakeholders", error: error.message };
  }
};

module.exports = {
  listStakeholdersAdminService,
  listStakeholdersClientService,
};
