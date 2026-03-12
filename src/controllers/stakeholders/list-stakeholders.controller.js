// controllers/stakeholders/get-stakeholders.controller.js

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
 * Controller: Get Stakeholders (list)
 *
 * @route  GET /software-management-service/api/v1/admin/get-stakeholders
 * @access Private – Admin (all roles)
 *
 * @query {string}  [projectId]       - Filter by project
 * @query {string}  [role]            - Filter by role
 * @query {string}  [stakeholderId]   - Filter by custom stakeholderId (USR…)
 * @query {boolean} [includeDeleted]  - Include soft-deleted records (default: false)
 * @query {number}  [page]            - Page number (default: 1)
 * @query {number}  [limit]           - Records per page (default: 20, max: 100)
 *
 * @returns {200} Paginated stakeholder list
 * @returns {500} Internal server error
 */
const getStakeholdersController = async (req, res) => {
  try {
    const {
      projectId,
      role,
      stakeholderId,
      includeDeleted,
      page,
      limit,
    } = req.query;

    const result = await getStakeholdersService(
      {
        projectId,
        role,
        stakeholderId,
        includeDeleted: includeDeleted === "true",
      },
      { page, limit }
    );

    if (!result.success) {
      logWithTime(`❌ [getStakeholdersController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    // Enrich each stakeholder with resolved name (batch lookup from Admin/Client)
    const enriched = await enrichStakeholdersWithName(result.stakeholders);

    logWithTime(`✅ [getStakeholdersController] Stakeholders list fetched successfully | ${getLogIdentifiers(req)}`);
    return sendStakeholdersListFetchedSuccess(
      res,
      enriched,
      result.total,
      result.page,
      result.totalPages
    );
  } catch (error) {
    logWithTime(`❌ [getStakeholdersController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getStakeholdersController };
