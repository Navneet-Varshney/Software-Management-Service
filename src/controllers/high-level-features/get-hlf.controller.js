// controllers/high-level-features/get-hlf.controller.js

const {
  getHlfAdminService,
  getHlfClientService,
} = require("@services/high-level-features/get-hlf.service");
const { sendHlfFetchedSuccess } = require("@/responses/success/hlf.response");
const {
  throwInternalServerError,
  throwSpecificInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");

const getHlfController = async (req, res) => {
  try {
    const hlf = req.foundHlf || req.hlf;
    const authorizationContext = req.authorizationContext || {};
    const shouldUseRestrictedView = authorizationContext.grantedBy === "stakeholder-membership";

    const result = shouldUseRestrictedView
      ? await getHlfClientService(hlf)
      : await getHlfAdminService(hlf);

    if (!result.success) {
      logWithTime(`❌ [getHlfController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, result.message);
    }

    logWithTime(`✅ [getHlfController] High-level feature fetched successfully | ${getLogIdentifiers(req)}`);
    return sendHlfFetchedSuccess(res, result.hlf);

  } catch (error) {
    logWithTime(`❌ [getHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    errorMessage(error);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getHlfController };
