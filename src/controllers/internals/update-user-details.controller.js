const { updateUserDetailsService } = require("@services/internals/update-user-details.service");
const { sendToggleActiveStatusSuccess } = require("@responses/internals/common.response");
const {
  throwConflictError,
  throwSpecificInternalServerError,
  throwInternalServerError
} = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * Update User Details Controller
 * Updates the firstName for a user or admin
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.userId - The custom user/admin ID
 * @param {string} req.body.type - The entity type (ADMIN, USER, CLIENT)
 * @param {string} req.body.firstName - The new firstName to update
 * @param {Object} req.admin - Admin object from middleware { adminId, ... }
 * @param {string} req.requestId - Request ID for tracking
 * @param {Object} res - Express response object
 */
const updateUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, firstName } = req.body;

    // Validate that type and firstName are provided
    if (!type) {
      return throwSpecificInternalServerError(res, "Type is required in request body");
    }

    if (!firstName || typeof firstName !== 'string') {
      return throwSpecificInternalServerError(res, "firstName must be a non-empty string");
    }

    // Extract admin info from request
    const executedBy = req.admin?.adminId || userId;
    const requestId = req.requestId;

    // Call the update service
    const result = await updateUserDetailsService(userId, type, firstName, executedBy, requestId);

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
    logWithTime(`❌ Error in updateUserDetails controller: ${error.message}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = {
  updateUserDetails
};
