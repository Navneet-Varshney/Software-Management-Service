/**
 * Admin Panel Service Client
 * 
 * Internal API client for communicating with Admin Panel Service.
 * Handles internal admin coordination endpoints.
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
const { createInternalServiceClient } = require('@/utils/internal-service-client.util');

const { logWithTime } = require('@/utils/time-stamps.util');
const { ADMIN_PANEL_URIS } = require('@/configs/internal-uri.config');

/**
 * Create axios instance with service authentication
 */
const createAdminClient = async () => {
    const serviceToken = await getServiceToken(SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE);
    return createInternalServiceClient(
        INTERNAL_API.ADMIN_PANEL_SERVICE_URL,
        serviceToken,
        SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE,
        INTERNAL_API.TIMEOUT,
        INTERNAL_API.RETRY_ATTEMPTS,
        INTERNAL_API.RETRY_DELAY
    );
};

/**
 * Health check for Admin Panel Service
 * 
 * @returns {Promise<Object>} Health status response
 */
const healthCheck = async () => {
    try {
        logWithTime('🏥 Checking Admin Panel Service health...');
        
        const client = await createAdminClient();
        const result = await client.callService({
            method: ADMIN_PANEL_URIS.HEALTH_CHECK.method,
            uri: ADMIN_PANEL_URIS.HEALTH_CHECK.uri
        });

        if (result.success && result.data?.success === true) {
            logWithTime('✅ Admin Panel Service is live');
            return {
                success: true,
                data: result.data
            };
        } else {
            logWithTime('⚠️  Admin Panel Service responded but status is not healthy');
            return {
                success: false,
                error: result.error || 'Service not healthy'
            };
        }
    } catch (error) {
        logWithTime(`❌ Admin Panel Service health check failed: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
};
module.exports = {
    healthCheck
};