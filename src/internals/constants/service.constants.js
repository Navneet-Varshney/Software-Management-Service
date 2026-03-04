/**
 * Service Constants
 * 
 * Central configuration for microservice architecture.
 * These constants are derived from the centralized microservice.config.js
 * to ensure consistency across the application.
 * 
 * @author Admin Panel Service Team 
 * @date 2026-03-04
 */

const guard = require('../microservice.guard');
if (!guard) {
    module.exports = null;
    return;
}

const { service } = require('@/configs/security.config');
const { microserviceConfig } = require('@/configs/microservice.config');

module.exports = {
    // Service Names
    SERVICE_NAMES: {
        AUTH_SERVICE: service.Custom_Auth_Service_Name,
        ADMIN_PANEL_SERVICE: service.Admin_Panel_Service_Name,
        SOFTWARE_MANAGEMENT_SERVICE: service.Software_Management_Service_Name
    },

    // Service Token Configuration
    // All values imported from microservice.config.js (SINGLE SOURCE OF TRUTH)
    SERVICE_TOKEN: {
        EXPIRY: microserviceConfig.serviceToken.expiry,
        ROTATION_THRESHOLD: microserviceConfig.serviceToken.rotationThreshold,
        SECRET: microserviceConfig.serviceToken.secret,
        ALGORITHM: microserviceConfig.serviceToken.algorithm
    },

    // Redis Configuration
    // All values imported from microservice.config.js (SINGLE SOURCE OF TRUTH)
    REDIS: {
        KEY_PREFIX: microserviceConfig.redis.keyPrefix,
        SESSION_TTL: microserviceConfig.redis.sessionTTL,
        KEY_SALT: microserviceConfig.redis.keySalt
    },

    // Internal API Configuration
    // All values imported from microservice.config.js (SINGLE SOURCE OF TRUTH)
    INTERNAL_API: {
        CUSTOM_AUTH_SERVICE_URL: microserviceConfig.services.customAuth,
        SOFTWARE_MANAGEMENT_BASE_URL: microserviceConfig.services.softwareManagement,
        ADMIN_PANEL_SERVICE_URL: microserviceConfig.services.adminPanel,
        TIMEOUT: microserviceConfig.internalApi.timeout,
        RETRY_ATTEMPTS: microserviceConfig.internalApi.retryAttempts,
        RETRY_DELAY: microserviceConfig.internalApi.retryDelay
    },

    // Device Configuration
    // Imported from microservice.config.js
    DEVICE: {
        UUID: microserviceConfig.device.uuid,
        TYPE: microserviceConfig.device.type
    },

    // Service Token Header
    HEADERS: {
        SERVICE_TOKEN: 'x-service-token',
        SERVICE_NAME: 'x-service-name',
        REQUEST_ID: 'x-request-id',
        DEVICE_UUID: 'x-device-uuid',
        DEVICE_TYPE: 'x-device-type'
    }
};