const { toggleBlockDeviceStatusService } = require("@services/internals/toggle-block-status-device.service");
const { sendToggleBlockDeviceStatusSuccess } = require("@responses/internals/common.response");
const {
  throwConflictError,
  throwSpecificInternalServerError,
  throwInternalServerError
} = require("@responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * Toggle Block Status Controller
 * Toggles the isBlocked flag for a device
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.deviceUUID - The custom device ID
 * @param {boolean} req.body.isBlocked - The new isBlocked status
 * @param {Object} req.admin - Admin object from middleware { adminId, ... }
 * @param {string} req.requestId - Request ID for tracking
 * @param {Object} res - Express response object
 */
const toggleBlockDeviceStatus = async (req, res) => {
  try {
    const { deviceUUID } = req.params;
    const { isBlocked, adminId } = req.body;

    if (isBlocked === undefined || isBlocked === null) {
      return throwSpecificInternalServerError(res, "isBlocked flag is required in request body");
    }

    // Extract admin info from request
    const executedBy = adminId;
    const requestId = req.requestId;

    // Call the toggle service
    const result = await toggleBlockDeviceStatusService(deviceUUID, isBlocked, executedBy, requestId);

    // Handle failure responses
    if (!result.success) {
      // Conflict error: User not found
      if (result.type === "Conflict") {
        return throwConflictError(
          res,
          result.message,
          `Please verify the device ID (${deviceUUID}) and type (${type}) are correct.`
        );
      }

      // Other errors: Internal server error
      return throwSpecificInternalServerError(res, result.message);
    }

    // Success response
    return sendToggleBlockDeviceStatusSuccess(res, result.data);

  } catch (error) {
    logWithTime(`❌ Error in toggleBlockDeviceStatus controller: ${error.message}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = {
  toggleBlockDeviceStatus
};
