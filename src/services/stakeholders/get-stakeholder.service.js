// services/stakeholders/get-stakeholder.service.js

const { StakeholderModel } = require("@models/stakeholder.model");
const { isValidCustomId }   = require("@utils/id-validators.util");

/**
 * Fetches a single stakeholder by MongoDB _id.
 * Guards against deleted stakeholders.
 *
 * @param {string} stakeholderId - MongoDB ObjectId string
 * @param {Object} auditContext  - { admin, device, requestId }
 * @returns {{ success: boolean, stakeholder?: Object, message?: string }}
 */
const getStakeholderService = async (stakeholderId, auditContext) => {
  try {
    if (!isValidCustomId(stakeholderId)) {
      return { success: false, message: "Invalid stakeholderId format" };
    }

    const stakeholder = await StakeholderModel.findOne({stakeholderId, isDeleted: false }).lean();

    if (!stakeholder)         return { success: false, message: "Stakeholder not found" };
    if (stakeholder.isDeleted) return { success: false, message: "Stakeholder is deleted" };

    return { success: true, stakeholder };

  } catch (error) {
    return { success: false, message: "Internal error while fetching stakeholder", error: error.message };
  }
};

module.exports = { getStakeholderService };
