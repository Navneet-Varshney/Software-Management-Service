const { ServiceTrackerModel } = require("@models/service-tracker.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@/responses/common/error-handler.response");
const { SYSTEM_LOG_EVENTS, STATUS_TYPES, SERVICE_NAMES } = require("@configs/system-log-events.config");
const { getServerInstanceId, extractRequestMetadata } = require("@utils/server-instance.util");

/**
 * Logs a system/service event (fire-and-forget)
 * 
 * @param {Object} logData - Log data object
 * @param {string} logData.serviceName - Name of the service (from SERVICE_NAMES)
 * @param {string} logData.eventType - Event type (from SYSTEM_LOG_EVENTS)
 * @param {string} logData.action - Action identifier (e.g., "CREATE_SUPER_ADMIN")
 * @param {string} logData.description - Human-readable description
 * @param {string} [logData.status] - Status (from STATUS_TYPES, default: SUCCESS)
 * @param {string} [logData.targetId] - Target ID (userId, adminId, etc.)
 * @param {string} [logData.executedBy] - Who executed (userId, adminId, or "SYSTEM"/"CRON")
 * @param {Object} [logData.metadata] - Additional metadata
 * @param {Object} [req] - Express request object (optional, for HTTP requests)
 */

const logServiceTrackerEvent = (logData, req = null) => {
  (async () => {
    try {
      // Validate required fields
      if (!logData?.serviceName || !logData?.eventType || !logData?.action || !logData?.description) {
        logWithTime("⚠️ Missing required fields in service tracker log. Skipping.");
        return;
      }

      // Validate serviceName
      const validServiceNames = Object.values(SERVICE_NAMES);
      if (!validServiceNames.includes(logData.serviceName)) {
        logWithTime(`⚠️ Invalid serviceName: ${logData.serviceName}. Skipping service log.`);
        return;
      }

      // Validate eventType
      const validEvents = Object.values(SYSTEM_LOG_EVENTS);
      if (!validEvents.includes(logData.eventType)) {
        logWithTime(`⚠️ Invalid eventType: ${logData.eventType}. Skipping service log.`);
        return;
      }

      // Validate status
      const validStatuses = Object.values(STATUS_TYPES);
      const status = logData.status || STATUS_TYPES.SUCCESS;
      if (!validStatuses.includes(status)) {
        logWithTime(`⚠️ Invalid status: ${status}. Using default SUCCESS.`);
      }

      // Get server instance ID
      const serverInstanceId = getServerInstanceId();

      // Extract request metadata if req is provided
      const requestMetadata = extractRequestMetadata(req);

      // Construct log object
      const serviceLog = {
        serviceName: logData.serviceName,
        serverInstanceId,
        sourceService: requestMetadata.sourceService || logData.sourceService || null,
        requestId: requestMetadata.requestId || logData.requestId || null,
        eventType: logData.eventType,
        action: logData.action,
        status: status,
        description: logData.description,
        targetId: logData.targetId || null,
        executedBy: logData.executedBy || null,
        ipAddress: requestMetadata.ipAddress || logData.ipAddress || null,
        userAgent: requestMetadata.userAgent || logData.userAgent || null,
        metadata: logData.metadata || {}
      };

      // Save to database atomically using create()
      await ServiceTrackerModel.create(serviceLog);

      logWithTime(
        `📗 ServiceTracker saved: ${logData.eventType} | Action: ${logData.action} | Service: ${logData.serviceName} | Status: ${status}`
      );

    } catch (err) {
      logWithTime(
        `❌ Internal Error saving ServiceTracker for event: ${logData?.eventType || "UNKNOWN"}`
      );
      errorMessage(err);
    }
  })();
};

/**
 * Log successful system event (shorthand)
 * 
 * @param {string} serviceName - Service name (from SERVICE_NAMES)
 * @param {string} eventType - Event type (from SYSTEM_LOG_EVENTS)
 * @param {string} action - Action identifier
 * @param {string} description - Description
 * @param {Object} options - Additional options (targetId, executedBy, metadata)
 * @param {Object} req - Express request object (optional)
 */
const logSuccess = (serviceName, eventType, action, description, options = {}, req = null) => {
  logServiceTrackerEvent({
    serviceName,
    eventType,
    action,
    description,
    status: STATUS_TYPES.SUCCESS,
    ...options
  }, req);
};

/**
 * Log failed system event (shorthand)
 * 
 * @param {string} serviceName - Service name (from SERVICE_NAMES)
 * @param {string} eventType - Event type (from SYSTEM_LOG_EVENTS)
 * @param {string} action - Action identifier
 * @param {string} description - Description
 * @param {Object} options - Additional options (targetId, executedBy, metadata)
 * @param {Object} req - Express request object (optional)
 */
const logFailure = (serviceName, eventType, action, description, options = {}, req = null) => {
  logServiceTrackerEvent({
    serviceName,
    eventType,
    action,
    description,
    status: STATUS_TYPES.FAILURE,
    ...options
  }, req);
};

/**
 * Log error system event (shorthand)
 * 
 * @param {string} serviceName - Service name (from SERVICE_NAMES)
 * @param {string} eventType - Event type (from SYSTEM_LOG_EVENTS)
 * @param {string} action - Action identifier
 * @param {string} description - Description
 * @param {Object} options - Additional options (targetId, executedBy, metadata)
 * @param {Object} req - Express request object (optional)
 */
const logError = (serviceName, eventType, action, description, options = {}, req = null) => {
  logServiceTrackerEvent({
    serviceName,
    eventType,
    action,
    description,
    status: STATUS_TYPES.ERROR,
    ...options
  }, req);
};

module.exports = {
  logServiceTrackerEvent,
  logSuccess,
  logFailure,
  logError
};
