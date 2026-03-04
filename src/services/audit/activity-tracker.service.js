const { ActivityTrackerModel } = require("@models/activity-tracker.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@/responses/common/error-handler.response");
const { ACTIVITY_TRACKER_EVENTS } = require("@/configs/tracker.config");
const { ACTIVITY_TRACKING_ENABLED, ADVANCED_LOGGING_ENABLED } = require("@/configs/security.config");

/**
 * Logs an authentication / admin activity event (fire-and-forget)
 */
const logActivityTrackerEvent = (
  admin,
  device,
  requestId,
  eventType,
  description,
  logOptions = {}
) => {
  (async () => {
    try {
      // Check if activity tracking is enabled
      if (!ACTIVITY_TRACKING_ENABLED) {
        // Silently skip if disabled
        return;
      }

      const validEvents = Object.values(ACTIVITY_TRACKER_EVENTS);

      if (!validEvents.includes(eventType)) {
        logWithTime(`⚠️ Invalid eventType: ${eventType}. Skipping activity log.`);
        return;
      }

      // Validate Admin
      if (!admin?.adminId) {
        logWithTime("⚠️ Missing admin information. Skipping activity log.");
        return;
      }

      // Base Log Object (Centralized)
      const baseLog = {
        adminId: admin.adminId,
        requestId: requestId,
        deviceUUID: device.deviceUUID,
        deviceType: device.deviceType,
        deviceName: device.deviceName,
        eventType,
        description:
          description || `Performed ${eventType} by ${admin.adminId}`,
        performedBy: admin.adminType,
        oldData: logOptions.oldData || null,
        newData: logOptions.newData || null,
      };

      // Construct Admin Actions
      const adminActions = {};

      const targetId = logOptions.adminActions?.targetId || null;
      const reason = logOptions.adminActions?.reason || null;
      const filter =
        logOptions.adminActions?.filter;

      if (ADVANCED_LOGGING_ENABLED) {
        const queryFilter = logOptions.adminActions?.queryFilter || null;

        if (queryFilter) {
          adminActions.queryFilter = queryFilter;
        }
      }

      // Decide performedOn centrally
      if (targetId) {
        adminActions.targetId = targetId;
        adminActions.performedOn = logOptions.adminActions?.performedOn || null;
      }

      // Reason
      if (reason) {
        adminActions.reason = reason;
      }

      // Filter validation
      if (Array.isArray(filter)) {
        const validFilters = filter.filter((f) =>
          validEvents.includes(f)
        );

        if (validFilters.length > 0) {
          adminActions.filter = validFilters;
        }
      }

      // Attach only if exists
      if (Object.keys(adminActions).length > 0) {
        baseLog.adminActions = adminActions;
      }

      // Save atomically using create()
      await ActivityTrackerModel.create(baseLog);

      logWithTime(
        `📘 ActivityTracker saved: ${eventType} | Admin: ${admin.adminId} | deviceUUID: ${device.deviceUUID} | requestId: ${requestId}`
      );
    } catch (err) {
      logWithTime(
        `❌ Internal Error saving AuthLog for event: ${eventType}`
      );
      errorMessage(err);
    }
  })();
};

module.exports = {
  logActivityTrackerEvent,
};