// controllers/inceptions/get-latest-inception.controller.js

const { getLatestInceptionService } = require("@/services/inceptions/get-latest-inception.service");
const { sendLatestInceptionFetchedSuccess } = require("@/responses/success/inception.response");
const {
  throwInternalServerError,
  getLogIdentifiers,
  throwSpecificInternalServerError,
  throwDBResourceNotFoundError
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Controller: Get Latest Inception Cycle for a Project
 *
 * @route  GET /software-management-service/api/v1/inceptions/get/:projectId
 * @access Private – All admin roles
 *
 * Fetches the latest (most recent) inception cycle for a given project.
 *
 * @returns {200} Latest inception details
 * @returns {400} Invalid projectId
 * @returns {404} No inception found
 * @returns {500} Internal server error
 */
const getLatestInceptionController = async (req, res) => {
  try {

    const  projectId = req.project._id;

    // Call service
    const result = await getLatestInceptionService(projectId);

    if (!result.success) {
      if (result.message === "No inception found for this project.") {
        logWithTime(`⚠️ [getLatestInceptionController] No inception found for projectId: ${projectId} | ${getLogIdentifiers(req)}`);
        return throwDBResourceNotFoundError(res, "Inception");
      }
      logWithTime(`❌ [getLatestInceptionController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwSpecificInternalServerError(res, "Inception");
    }

    logWithTime(`✅ [getLatestInceptionController] Latest inception fetched successfully | ${getLogIdentifiers(req)}`);
    return sendLatestInceptionFetchedSuccess(res, result.inception);

  } catch (error) {
    logWithTime(`❌ [getLatestInceptionController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { getLatestInceptionController };
