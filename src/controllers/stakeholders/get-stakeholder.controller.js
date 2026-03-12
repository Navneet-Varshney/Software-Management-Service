// controllers/stakeholders/get-stakeholder.controller.js

const { getStakeholderService } = require("@services/stakeholders/get-stakeholder.service");
const { resolveStakeholderName } = require("@utils/resolve-stakeholder-name.util");
const { sendStakeholderFetchedSuccess } = require("@/responses/success/stakeholder.response");
const {
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Get Stakeholder
 *
 * @route  GET /software-management-service/api/v1/admin/get-stakeholder/:stakeholderId
 * @access Private – Admin (all roles)
 *
 * @param {string} stakeholderId - MongoDB ObjectId (from URL param)
 *
 * @returns {200} Stakeholder data
 * @returns {400} Invalid ID or deleted
 * @returns {404} Not found
 * @returns {500} Internal server error
 */
const getStakeholderController = async (req, res) => {
  try {
    const { stakeholderId } = req.params;

    const result = await getStakeholderService(stakeholderId, {
      admin:     req.admin,
      device:    req.device,
      requestId: req.requestId,
    });

    if (!result.success) {
      if (result.message === "Stakeholder not found") {
        logWithTime(`❌ [getStakeholderController] Stakeholder not found | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Stakeholder");
      }
      if (result.message === "Stakeholder is deleted") {
        logWithTime(`❌ [getStakeholderController] Stakeholder is deleted | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Stakeholder is deleted", "This stakeholder has been deleted.");
      }
      if (result.message === "Invalid stakeholderId format") {
        logWithTime(`❌ [getStakeholderController] Invalid stakeholderId format | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Invalid stakeholderId format", "stakeholderId must be a valid MongoDB ObjectId.");
      }
      logWithTime(`❌ [getStakeholderController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    // Resolve name from AdminModel / ClientModel and attach to response
    const name = await resolveStakeholderName(result.stakeholder.stakeholderId);
    const enriched = { ...result.stakeholder, name };

    logWithTime(`✅ [getStakeholderController] Stakeholder fetched successfully | ${getLogIdentifiers(req)}`);
    return sendStakeholderFetchedSuccess(res, enriched);
  } catch (error) {
    logWithTime(`❌ [getStakeholderController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getStakeholderController };
