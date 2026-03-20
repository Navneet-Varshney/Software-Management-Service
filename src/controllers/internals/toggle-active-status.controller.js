const { toggleActiveStatusService } = require("@services/internals/toggle-active-status.service");
const { sendToggleActiveStatusSuccess } = require("@responses/internals/common.response");
const {
  throwConflictError,
  throwSpecificInternalServerError,
  throwInternalServerError
} = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * Toggle Active Status Controller
 * Toggles the isActive flag for a user or admin
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.userId - The custom user/admin ID
 * @param {string} req.body.type - The entity type (ADMIN, USER, CLIENT)
 * @param {boolean} req.body.isActive - The new isActive status
 * @param {Object} req.admin - Admin object from middleware { adminId, ... }
 * @param {string} req.requestId - Request ID for tracking
 * @param {Object} res - Express response object
 */
const toggleActiveStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, isActive } = req.body;

    // Validate that type and isActive are provided
    if (!type) {
      return throwSpecificInternalServerError(res, "Type is required in request body");
    }

    if (isActive === undefined || isActive === null) {
      return throwSpecificInternalServerError(res, "isActive flag is required in request body");
    }

    // Extract admin info from request
    const executedBy = req.admin?.adminId || userId;
    const requestId = req.requestId;

    // Call the toggle service
    const result = await toggleActiveStatusService(userId, type, isActive, executedBy, requestId);

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
    return sendToggleActiveStatusSuccess(res, result.data);

  } catch (error) {
    logWithTime(`❌ Error in toggleActiveStatus controller: ${error.message}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = {
  toggleActiveStatus
};
