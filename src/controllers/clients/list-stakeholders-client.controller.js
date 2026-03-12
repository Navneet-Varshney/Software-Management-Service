// controllers/clients/list-stakeholders.controller.js

const { getStakeholdersService } = require("@services/stakeholders/get-stakeholders.service");
const { enrichStakeholdersWithName } = require("@utils/resolve-stakeholder-name.util");
const { sendStakeholdersListFetchedSuccess } = require("@/responses/success/stakeholder.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: List Stakeholders – Client View
 *
 * @route  GET /software-management-service/api/v1/admin/client/list-stakeholders
 * @access Private – All admin roles (serves client-facing data)
 *
 * Returns non-deleted stakeholders only.
 * Each stakeholder includes `stakeholderId` + resolved `name` (firstName)
 * looked up from AdminModel / ClientModel.
 *
 * @query {string}  [projectId]     - Filter by project
 * @query {string}  [role]          - Filter by role
 * @query {string}  [stakeholderId] - Filter by custom stakeholderId (USR…)
 * @query {number}  [page]          - Page number (default: 1)
 * @query {number}  [limit]         - Records per page (default: 20, max: 100)
 *
 * @returns {200} Paginated stakeholder list with name
 * @returns {500} Internal server error
 */
const listStakeholdersClientController = async (req, res) => {
  try {
    const { projectId, role, stakeholderId } = req.query;

    const page  = Math.max(1, parseInt(req.query.page,  10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const result = await getStakeholdersService(
      { projectId, role, stakeholderId, includeDeleted: false },
      { page, limit }
    );

    if (!result.success) {
      logWithTime(`❌ [listStakeholdersClientController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    // Enrich each stakeholder with resolved name (batch lookup)
    const enriched = await enrichStakeholdersWithName(result.stakeholders);

    logWithTime(`✅ [listStakeholdersClientController] Stakeholders list fetched successfully | ${getLogIdentifiers(req)}`);
    return sendStakeholdersListFetchedSuccess(res, enriched, result.total, result.page, result.totalPages);
  } catch (error) {
    logWithTime(`❌ [listStakeholdersClientController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listStakeholdersClientController };
