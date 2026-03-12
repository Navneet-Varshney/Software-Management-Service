// controllers/clients/get-stakeholders-client.controller.js

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
 * Controller: Get Single Stakeholder – Client View
 *
 * @route  GET /software-management-service/api/v1/admin/client/get-stakeholder/:stakeholderId
 * @access Private – All admin roles (serves client-facing data)
 *
 * Returns the stakeholder document enriched with a `name` field
 * (firstName resolved from AdminModel / ClientModel).
 * Deleted stakeholders are treated as not found.
 *
 * @param {string} stakeholderId - Custom USR-prefixed stakeholder ID (URL param)
 *
 * @returns {200} Stakeholder data with name
 * @returns {400} Invalid or deleted stakeholder
 * @returns {404} Not found
 * @returns {500} Internal server error
 */
const getStakeholderClientController = async (req, res) => {
  try {
    const { stakeholderId } = req.params;

    const result = await getStakeholderService(stakeholderId, {
      admin:     req.admin,
      device:    req.device,
      requestId: req.requestId,
    });

    if (!result.success) {
      if (result.message === "Stakeholder not found") {
        logWithTime(`❌ [getStakeholderClientController] Stakeholder not found | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Stakeholder");
      }
      if (result.message === "Stakeholder is deleted") {
        logWithTime(`❌ [getStakeholderClientController] Stakeholder is deleted | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Stakeholder is deleted", "This stakeholder has been deleted.");
      }
      if (result.message === "Invalid stakeholderId format") {
        logWithTime(`❌ [getStakeholderClientController] Invalid stakeholderId format | ${getLogIdentifiers(req)}`);
        return throwBadRequestError(res, "Invalid stakeholderId format", "stakeholderId must be a valid custom ID.");
      }
      logWithTime(`❌ [getStakeholderClientController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    // Resolve name from AdminModel / ClientModel
    const name = await resolveStakeholderName(result.stakeholder.stakeholderId);
    const enriched = { ...result.stakeholder, name };

    logWithTime(`✅ [getStakeholderClientController] Stakeholder fetched successfully | ${getLogIdentifiers(req)}`);
    return sendStakeholderFetchedSuccess(res, enriched);
  } catch (error) {
    logWithTime(`❌ [getStakeholderClientController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getStakeholderClientController };
