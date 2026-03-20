
const { deleteUserService } = require("@services/internals/delete-user.service");
const { sendDeleteUserSuccess } = require("@responses/internals/common.response");
const {
  throwConflictError,
  throwSpecificInternalServerError,
  throwInternalServerError
} = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * Delete User Controller
 * Hard soft-deletes a user or admin by setting isDeleted: true
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.userId - The custom user/admin ID to delete
 * @param {string} req.body.type - The entity type (ADMIN, USER, CLIENT)
 * @param {Object} req.admin - Admin object from middleware { adminId, ... }
 * @param {string} req.requestId - Request ID for tracking
 * @param {Object} res - Express response object
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.body;

    // Validate that type is provided
    if (!type) {
      return throwSpecificInternalServerError(res, "Type is required in request body");
    }

    // Extract admin info from request
    const executedBy = userId;
    const requestId = req.requestId;

    // Call the delete service
    const result = await deleteUserService(userId, type, executedBy, requestId);

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
    return sendDeleteUserSuccess(res, result.data);

  } catch (error) {
    logWithTime(`❌ Error in deleteUser controller: ${error.message}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = {
  deleteUser
};