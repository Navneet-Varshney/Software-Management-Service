/**
 * Microservice Configuration
 * 
 * Central configuration for microservice mode settings.
 * This is the SINGLE SOURCE OF TRUTH for all microservice-related configurations.
 * All values are configurable via environment variables.
 */

const { getMyEnv, getMyEnvAsNumber, getMyEnvAsBool } = require('@/utils/env.util');

/**
 * Parse time duration from environment variable
 * Supports formats: "15m", "1h", "1d", or raw seconds as number
 * @param {string} envKey - Environment variable key
 * @param {number} defaultSeconds - Default value in seconds
 * @returns {number} Duration in seconds
 */
const parseDuration = (envKey, defaultSeconds) => {
    const value = process.env[envKey];
    if (!value) return defaultSeconds;

    // If it's a number, return as is
    if (!isNaN(value)) return parseInt(value);

    // Parse time units
    const match = value.match(/^(\d+)([smhd])$/);
    if (!match) return defaultSeconds;

    const num = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
        case 's': return num;           // seconds
        case 'm': return num * 60;      // minutes
        case 'h': return num * 60 * 60; // hours
        case 'd': return num * 24 * 60 * 60; // days
        default: return defaultSeconds;
    }
};

const microserviceConfig = {
    // Is microservice mode enabled?
    enabled: getMyEnvAsBool('MAKE_IT_MICROSERVICE', false),

    // Service token settings
    serviceToken: {
        // Software Management Service uses its OWN secret to generate tokens
        secret: getMyEnv('SOFTWARE_MANAGEMENT_SERVICE_TOKEN_SECRET'),
        // Token expiry in seconds (default: 1 hour)
        // Supports: "15m", "1h", "2h", or raw seconds
        expiry: parseDuration('SERVICE_TOKEN_EXPIRY', 60 * 60),
        // Rotation threshold in seconds (default: 10 minutes)
        // Token will be rotated when remaining time < this threshold
        rotationThreshold: parseDuration('SERVICE_TOKEN_ROTATION_THRESHOLD', 10 * 60),
        // JWT algorithm
        algorithm: getMyEnv('SERVICE_TOKEN_ALGORITHM', 'HS256')
    },

    // Service instance name
    instanceName: getMyEnv('SERVICE_INSTANCE_NAME', 'admin-panel-service-default'),

    // Redis session settings
    redis: {
        // Salt for Redis key hashing
        keySalt: getMyEnv('REDIS_KEY_SALT', 'default-salt-change-in-production'),
        // Key prefix for all session keys
        keyPrefix: getMyEnv('REDIS_SESSION_KEY_PREFIX', 'auth:session:'),
        // Session TTL in seconds (default: 8 days)
        // Supports: "7d", "24h", or raw seconds
        sessionTTL: parseDuration('REDIS_SESSION_TTL', 8 * 24 * 60 * 60)
    },

    // Internal service URLs
    services: {
        customAuth: getMyEnv('CUSTOM_AUTH_SERVICE_URI', 'http://localhost:8080'),
        adminPanel: getMyEnv('ADMIN_PANEL_SERVICE_URI', getMyEnv('ADMIN_PANEL_SERVICE_URL', 'http://localhost:8081')),
        softwareManagement: getMyEnv('SOFTWARE_MANAGEMENT_SERVICE_URI', 'http://localhost:8082')
    },

    // Internal API settings
    internalApi: {
        // Request timeout in milliseconds
        timeout: getMyEnvAsNumber('INTERNAL_API_TIMEOUT', 10000),
        // Number of retry attempts for failed requests
        retryAttempts: getMyEnvAsNumber('INTERNAL_API_RETRY_ATTEMPTS', 3),
        // Delay between retry attempts in milliseconds
        retryDelay: getMyEnvAsNumber('INTERNAL_API_RETRY_DELAY', 1000)
    },

    // Device configuration for service-to-service calls
    device: {
        uuid: getMyEnv('DEVICE_UUID', '00000000-0000-4000-8000-000000000001'),
        type: getMyEnv('DEVICE_TYPE', 'LAPTOP')
    }
};

/**
 * Validate microservice configuration
 */
const validateMicroserviceConfig = () => {
    if (!microserviceConfig.enabled) {
        return { valid: true, mode: 'monolithic' };
    }

    const errors = [];
    const warnings = [];

    // Critical validations
    if (!microserviceConfig.serviceToken.secret) {
        errors.push('SOFTWARE_MANAGEMENT_SERVICE_TOKEN_SECRET is required when MAKE_IT_MICROSERVICE=true');
    }

    if (!microserviceConfig.redis.keySalt || microserviceConfig.redis.keySalt === 'default-salt-change-in-production') {
        errors.push('REDIS_KEY_SALT must be set to a secure value in production');
    }

    // Warnings for default values
    if (microserviceConfig.instanceName.includes('default')) {
        warnings.push('SERVICE_INSTANCE_NAME is using default value. Set a unique name for this service instance.');
    }

    if (microserviceConfig.serviceToken.expiry < 300) {
        warnings.push('SERVICE_TOKEN_EXPIRY is less than 5 minutes. This may cause frequent token rotations.');
    }

    if (microserviceConfig.serviceToken.rotationThreshold >= microserviceConfig.serviceToken.expiry) {
        errors.push('SERVICE_TOKEN_ROTATION_THRESHOLD must be less than SERVICE_TOKEN_EXPIRY');
    }

    if (microserviceConfig.redis.sessionTTL < 3600) {
        warnings.push('REDIS_SESSION_TTL is less than 1 hour. Sessions will expire quickly.');
    }

    if (errors.length > 0) {
        return { valid: false, errors, warnings, mode: 'microservice' };
    }

    return { valid: true, warnings, mode: 'microservice' };
};

/**
 * Log microservice configuration status
 */
const logMicroserviceStatus = () => {
    const validation = validateMicroserviceConfig();

    console.log('\n' + '='.repeat(60));
    if (validation.mode === 'monolithic') {
        console.log('🏢 Running in MONOLITHIC mode');
        console.log('   - No Redis session management');
        console.log('   - No service-to-service communication');
        console.log('   - No service tokens');
    } else {
        console.log('🔧 Running in MICROSERVICE mode');
        console.log(`   - Service Instance: ${microserviceConfig.instanceName}`);
        console.log(`   - Token Expiry: ${microserviceConfig.serviceToken.expiry}s (${Math.floor(microserviceConfig.serviceToken.expiry / 60)} minutes)`);
        console.log(`   - Token Rotation Threshold: ${microserviceConfig.serviceToken.rotationThreshold}s`);
        console.log(`   - Redis Session TTL: ${microserviceConfig.redis.sessionTTL}s (${Math.floor(microserviceConfig.redis.sessionTTL / 86400)} days)`);
        console.log(`   - API Timeout: ${microserviceConfig.internalApi.timeout}ms`);
        console.log(`   - API Retry Attempts: ${microserviceConfig.internalApi.retryAttempts}`);
        console.log(`\n   Services:`);
        console.log(`   - Custom Auth: ${microserviceConfig.services.customAuth}`);
        console.log(`   - Admin Panel: ${microserviceConfig.services.adminPanel}`);
        console.log(`   - Software Management: ${microserviceConfig.services.softwareManagement}`);
        
        if (validation.warnings && validation.warnings.length > 0) {
            console.log('\n⚠️  Configuration warnings:');
            validation.warnings.forEach(warning => console.log(`   - ${warning}`));
        }

        if (!validation.valid) {
            console.log('\n❌ Microservice configuration errors:');
            validation.errors.forEach(error => console.error(`   - ${error}`));
        } else {
            console.log('\n✅ Microservice configuration valid');
        }
    }
    console.log('='.repeat(60) + '\n');

    return validation;
};

module.exports = {
    microserviceConfig,
    validateMicroserviceConfig,
    logMicroserviceStatus
};
