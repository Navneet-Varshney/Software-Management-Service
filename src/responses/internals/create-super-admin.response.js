const { logWithTime } = require("@utils/time-stamps.util");
const { CREATED } = require("@configs/http-status.config");

/**
 * Response Handlers for Create Super Admin
 * 
 * Centralized response management following DRY principle
 * No hardcoded responses in controllers
 */

/**
 * Success Response - Super Admin Created
 * @param {Object} res - Express response object
 * @param {Object} data - Super admin data (adminId, adminType, firstName)
 */
const sendSuperAdminCreatedSuccess = (res, data) => {
    logWithTime("✅ Super admin created successfully");
    return res.status(CREATED).json({
        success: true,
        message: "Super admin created successfully",
        data: {
            adminId: data.adminId,
            adminType: data.adminType,
            firstName: data.firstName
        }
    });
};

module.exports = {
    sendSuperAdminCreatedSuccess
};
