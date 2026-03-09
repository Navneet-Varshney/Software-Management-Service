/**
 * Custom Auth Service Client
 * 
 * Internal API client for communicating with Custom Auth Service.
 * Handles identity bootstrapping, sync operations, and state management.
 * 
 * @author Admin Panel Service Team
 * @date 2026-03-06
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
const { AUTH_SERVICE_URIS } = require('@/configs/internal-uri.config');

/**
 * Get authenticated Auth Service client
 * @returns {Promise<Object>} Client with callService method
 */
const getAuthServiceClient = async () => {
    const serviceToken = await getServiceToken(SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE);
    
    return createInternalServiceClient(
        INTERNAL_API.CUSTOM_AUTH_SERVICE_URL,
        serviceToken,
        SERVICE_NAMES.SOFTWARE_MANAGEMENT_SERVICE,
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
            method: AUTH_SERVICE_URIS.HEALTH_CHECK.method,
            uri: AUTH_SERVICE_URIS.HEALTH_CHECK.uri
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

/**
 * Refresh access token using Auth Service's internal post-refresh endpoint
 * 
 * @param {string} refreshToken - Current refresh token
 * @param {string} deviceId - Device UUID
 * @param {string} userId - User/Admin ID
 * @returns {Promise<Object>} { success: boolean, newAccessToken?: string, error?: string }
 */
const refreshAccessTokenFromAuthService = async (refreshToken, deviceId, userId) => {
    try {
        logWithTime(`🔄 Requesting token refresh for device: ${deviceId.substring(0, 8)}...`);

        const client = await getAuthServiceClient();
        const result = await client.callService({
            method: AUTH_SERVICE_URIS.POST_REFRESH.method,
            uri: AUTH_SERVICE_URIS.POST_REFRESH.uri,
            body: {
                refreshToken,
                deviceUUID: deviceId,
                userId
            }
        });

        if (result.success && result.data?.success) {
            const newAccessToken = result.data.accessToken || result.data.data?.accessToken;
            
            if (!newAccessToken) {
                logWithTime(`❌ Token refresh response missing access token`);
                return {
                    success: false,
                    error: 'No access token in response'
                };
            }

            logWithTime(`✅ Access token refreshed successfully`);
            return {
                success: true,
                newAccessToken
            };
        } else {
            const errorDetail = typeof result.error === 'object' 
                ? JSON.stringify(result.error) 
                : result.error;
            logWithTime(`❌ Token refresh failed [${result.statusCode || 'N/A'}]: ${errorDetail}`);
            return {
                success: false,
                error: result.error || 'Token refresh failed',
                statusCode: result.statusCode
            };
        }
    } catch (error) {
        logWithTime(`❌ Failed to refresh access token: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
};

module.exports = {
    refreshAccessTokenFromAuthService,
    healthCheck
};