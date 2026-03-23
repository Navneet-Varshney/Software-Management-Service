// controllers/high-level-features/list-hlf.controller.js

const {
  listHlfAdminService,
  listHlfClientService,
} = require("@services/high-level-features/list-hlf.service");
const { sendHlfListFetchedSuccess } = require("@/responses/success/hlf.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");

const listHlfController = async (req, res) => {
  try {
    const inception = req.inception;
    const authorizationContext = req.authorizationContext || {};
    const shouldUseRestrictedView = authorizationContext.grantedBy === "stakeholder-membership";

    // Parse query filters and pagination
    const filters = {
      inceptionId: inception._id.toString(),
      includeDeleted: req.query.includeDeleted === "true" ? true : false,
    };

    const pagination = {
      page: req.query.page,
      limit: req.query.limit,
    };

    // Call appropriate service based on user type
    const result = shouldUseRestrictedView
      ? await listHlfClientService(filters, pagination)
      : await listHlfAdminService(filters, pagination);

    if (!result.success) {
      logWithTime(`❌ [listHlfController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [listHlfController] High-level features fetched successfully | ${getLogIdentifiers(req)}`);
    return sendHlfListFetchedSuccess(res, result.hlfs, result.total, result.page, result.totalPages);

  } catch (error) {
    logWithTime(`❌ [listHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { listHlfController };
