/**
 * Custom Auth Service Client
 * 
 * Internal API client for communicating with Custom Auth Service.
 * Handles identity bootstrapping, sync operations, and state management.
 * 
 * @author Admin Panel Service Team
 * @date 2026-03-04
 */

const guard = require('../microservice.guard');
if (!guard) {
    module.exports = null;
    return;
}

const { getServiceToken } = require('../service-token');
const { INTERNAL_API, SERVICE_NAMES } = require('../constants');
const { logWithTime } = require('@/utils/time-stamps.util');
const { createInternalServiceClient } = require('@/utils/internal-service-client.util');
const { CUSTOM_AUTH_URIS } = require('@/configs/internal-uri.config');

/**
 * Get authenticated Auth Service client
 * @returns {Promise<Object>} Client with callService method
 */
const getAuthServiceClient = async () => {
    const serviceToken = await getServiceToken(SERVICE_NAMES.ADMIN_PANEL_SERVICE);
    
    return createInternalServiceClient(
        INTERNAL_API.CUSTOM_AUTH_SERVICE_URL,
        serviceToken,
        SERVICE_NAMES.ADMIN_PANEL_SERVICE,
        INTERNAL_API.TIMEOUT,
        INTERNAL_API.RETRY_ATTEMPTS,
        INTERNAL_API.RETRY_DELAY
    );
};

/**
 * Health check for Auth Service
 * 
 * @returns {Promise<Object>} Health status response
 */
const healthCheck = async () => {
    try {
        logWithTime('🏥 Checking Auth Service health...');
        
        const client = await getAuthServiceClient();
        const result = await client.callService({
            method: CUSTOM_AUTH_URIS.HEALTH_CHECK.method,
            uri: CUSTOM_AUTH_URIS.HEALTH_CHECK.uri
        });

        if (result.success && result.data?.success === true) {
            logWithTime('✅ Auth Service is live');
            return {
                success: true,
                data: result.data
            };
        } else {
            logWithTime('⚠️  Auth Service responded but status is not healthy');
            return {
                success: false,
                error: result.error || 'Service not healthy'
            };
        }
    } catch (error) {
        logWithTime(`❌ Auth Service health check failed: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    healthCheck,
};