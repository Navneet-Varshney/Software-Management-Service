const { logWithTime } = require("@utils/time-stamps.util");
const { OK } = require("@configs/http-status.config");

/**
 * Common Response Handlers for Internal Routes
 * 
 * Centralized response management for internal/microservice communication
 * No hardcoded responses in routes
 */

/**
 * Success Response - Auth Service Health Check
 * @param {Object} res - Express response object
 * @param {Object} serviceAuth - Service authentication data
 */
const sendAuthServiceHealthSuccess = (res, serviceAuth) => {
    logWithTime("✅ Auth service health check successful");
    return res.status(OK).json({
        success: true,
        message: "Auth service endpoint is healthy",
        service: "admin-panel-service",
        requestedBy: {
            serviceName: serviceAuth.serviceName,
            serviceInstanceId: serviceAuth.serviceInstanceId
        },
        timestamp: new Date().toISOString()
    });
};

/**
 * Success Response - Software Management Service Health Check
 * @param {Object} res - Express response object
 * @param {Object} serviceAuth - Service authentication data
 */
const sendAdminPanelServiceHealthSuccess = (res, serviceAuth) => {
    logWithTime("✅ Admin panel service health check successful");
    return res.status(OK).json({
        success: true,
        message: "Admin panel service endpoint is healthy",
        service: "admin-panel-service",
        requestedBy: {
            serviceName: serviceAuth.serviceName,
            serviceInstanceId: serviceAuth.serviceInstanceId
        },
        timestamp: new Date().toISOString()
    });
};

/**
 * Success Response - Delete User
 * @param {Object} res - Express response object
 * @param {Object} data - Deleted user/admin data { userId, type }
 */
const sendDeleteUserSuccess = (res, data) => {
    logWithTime("✅ User deleted successfully");
    return res.status(OK).json({
        success: true,
        message: "User deleted successfully",
        data: {
            userId: data.userId || data.adminId,
            type: data.userType || "ADMIN"
        }
    });
};

/**
 * Success Response - Toggle Active Status
 * @param {Object} res - Express response object
 * @param {Object} data - Updated user/admin data with isActive status
 */
const sendToggleActiveStatusSuccess = (res, data) => {
    logWithTime("✅ Active status toggled successfully");
    return res.status(OK).json({
        success: true,
        message: "Active status toggled successfully",
        data: {
            userId: data.userId || data.adminId || data.clientId,
            isActive: data.isActive,
            type: data.userType || "ADMIN"
        }
    });
};

const sendToggleBlockDeviceStatusSuccess = (res, data) => {
    logWithTime("✅ Device block status toggled successfully");
    return res.status(OK).json({
        success: true,
        message: "Device block status toggled successfully",
        data: {
            deviceUUID: data.deviceUUID,
            isBlocked: data.isBlocked
        }
    });
};

const sendToggleBlockUserStatusSuccess = (res, data) => {
    logWithTime("✅ User block status toggled successfully");
    return res.status(OK).json({
        success: true,
        message: "User block status toggled successfully",
        data: {
            userId: data.userId || data.adminId || data.clientId,
            isBlocked: data.isBlocked,
            type: data.userType || "ADMIN"
        }
    });
};

/**
 * Success Response - Update Client Organizations
 * @param {Object} res - Express response object
 * @param {Object} data - Updated client data with organizations and isBlocked status
 */
const sendUpdateClientOrganizationsSuccess = (res, data) => {
    logWithTime("✅ Client organizations updated successfully");
    return res.status(OK).json({
        success: true,
        message: "Client organizations updated successfully",
        data: {
            clientId: data.clientId,
            organizations: data.organizations || []
        }
    });
};

module.exports = {
    // Health checks
    sendAuthServiceHealthSuccess,
    sendAdminPanelServiceHealthSuccess,
    sendDeleteUserSuccess,
    sendToggleActiveStatusSuccess,
    sendToggleBlockDeviceStatusSuccess,
    sendToggleBlockUserStatusSuccess,
    sendUpdateClientOrganizationsSuccess
};
