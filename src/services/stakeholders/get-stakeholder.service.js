// services/stakeholders/get-stakeholder.service.js

/**
 * Admin/full view of a stakeholder record.
 *
 * @param {Object} stakeholder
 * @returns {{ success: boolean, stakeholder?: Object, message?: string, error?: string }}
 */
const getStakeholderAdminService = async (stakeholder) => {
  try {
    const stakeholderData = stakeholder?.toObject ? stakeholder.toObject() : stakeholder;
    return { success: true, stakeholder: stakeholderData };
  } catch (error) {
    return { success: false, message: "Internal error while fetching stakeholder", error: error.message };
  }
};

/**
 * Restricted stakeholder view for stakeholder/member access.
 *
 * @param {Object} stakeholder
 * @returns {{ success: boolean, stakeholder?: Object, message?: string, error?: string }}
 */
const getStakeholderClientService = async (stakeholder) => {
  try {
    const stakeholderData = stakeholder?.toObject ? stakeholder.toObject() : stakeholder;

    return {
      success: true,
      stakeholder: {
        stakeholderId: stakeholderData.userId,
        role: stakeholderData.role,
        phase: stakeholderData.phase,
        joinedAt: stakeholderData.createdAt,
      },
    };
  } catch (error) {
    return { success: false, message: "Internal error while fetching stakeholder", error: error.message };
  }
};

module.exports = {
  getStakeholderAdminService,
  getStakeholderClientService,
};
