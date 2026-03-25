// controllers/inceptions/get-inception.controller.js

const { getInceptionService } = require("@/services/inceptions/get-inception.service");
const { sendInceptionFetchedSuccess } = require("@/responses/success/inception.response");
const {
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Get Inception Cycle for a Project
 *
 * @route  GET /software-management-service/api/v1/inceptions/get/:inceptionId
 * @access Private – All admin roles
 *
 * Fetches the inception cycle for a given project.
 *
 * @returns {200} Latest inception details
 * @returns {400} Invalid projectId
 * @returns {404} No inception found
 * @returns {500} Internal server error
 */
const getInceptionController = async (req, res) => {
  try {

    const inception = req.inception;

    // Call service
    const result = await getInceptionService(inception);

    if (!result.success) {
      logWithTime(`❌ [getInceptionController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, "Inception");
    }

    logWithTime(`✅ [getInceptionController]  Inception fetched successfully | ${getLogIdentifiers(req)}`);
    return sendInceptionFetchedSuccess(res, result.inception);

  } catch (error) {
    logWithTime(`❌ [getInceptionController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getInceptionController };
