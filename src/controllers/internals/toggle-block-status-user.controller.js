const { toggleBlockUserStatusService } = require("@services/internals/toggle-block-status-user.service");
const { sendToggleBlockUserStatusSuccess } = require("@responses/internals/common.response");
const {
  throwConflictError,
  throwSpecificInternalServerError,
  throwInternalServerError
} = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * Toggle Block Status Controller
 * Toggles the isBlocked flag for a user or admin
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.userId - The custom user/admin ID
 * @param {string} req.body.type - The entity type (ADMIN, USER, CLIENT)
 * @param {boolean} req.body.isBlocked - The new isBlocked status
 * @param {Object} req.admin - Admin object from middleware { adminId, ... }
 * @param {string} req.requestId - Request ID for tracking
 * @param {Object} res - Express response object
 */
const toggleBlockUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, isBlocked, adminId } = req.body;

    // Validate that type and isBlocked are provided
    if (!type) {
      return throwSpecificInternalServerError(res, "Type is required in request body");
    }

    if (isBlocked === undefined || isBlocked === null) {
      return throwSpecificInternalServerError(res, "isBlocked flag is required in request body");
    }

    // Extract admin info from request
    const executedBy = adminId;
    const requestId = req.requestId;

    // Call the toggle service
    const result = await toggleBlockUserStatusService(userId, type, isBlocked, executedBy, requestId);

    // Handle failure responses
    if (!result.success) {
      // Conflict error: User not found
      if (result.type === "Conflict") {
        return throwConflictError(
          res,
          result.message,
          `Please verify the user ID (${userId}) and type (${type}) are correct.`
        );
      }

      // Other errors: Internal server error
      return throwSpecificInternalServerError(res, result.message);
    }

    // Success response
    return sendToggleBlockUserStatusSuccess(res, result.data);

  } catch (error) {
    logWithTime(`❌ Error in toggleBlockUserStatus controller: ${error.message}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = {
  toggleBlockUserStatus
};
