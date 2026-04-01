const { MeetingStatuses } = require("@/configs/enums.config");
const { throwConflictError, throwInternalServerError, logMiddlewareError, throwSpecificInternalServerError } = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * Guard: Prevent updates/cancellations if meeting status is not DRAFT
 * Must run AFTER fetchMeetingMiddleware
 */
const meetingStatusGuardMiddleware = (req, res, next) => {
  try {
    if (!req.foundMeeting) {
      logMiddlewareError("meetingStatusGuard", "Meeting not found in request context", req);
      return throwSpecificInternalServerError(res, "Meeting not found in request context");
    }

    const currentStatus = req.foundMeeting.status;

    // Only allow modifications (UPDATE) if status is DRAFT
    if (currentStatus !== MeetingStatuses.DRAFT) {
      logMiddlewareError("meetingStatusGuard", `Cannot modify meeting ${req.foundMeeting._id} with status ${currentStatus}`, req);
      return throwConflictError(
        res,
        `Cannot modify meeting with status: ${currentStatus}`,
        `Only DRAFT meetings can be modified. Current status is ${currentStatus}.`
      );
    }

    logWithTime(`✅ Meeting status guard passed for ${req.foundMeeting._id}`);
    return next();

  } catch (error) {
    logMiddlewareError("meetingStatusGuard", `Internal error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

/**
 * Guard: Prevent any action if meeting is already finalized
 * (COMPLETED or CANCELLED)
 *
 * Must run AFTER fetchMeetingMiddleware
 */
const meetingFinalizedGuardMiddleware = (req, res, next) => {
  try {
    if (!req.foundMeeting) {
      logMiddlewareError("meetingFinalizedGuard", "Meeting not found in request context", req);
      return throwSpecificInternalServerError(res, "Meeting not found in request context");
    }

    const { status, _id } = req.foundMeeting;

    if (
      status === MeetingStatuses.COMPLETED ||
      status === MeetingStatuses.CANCELLED
    ) {
      logMiddlewareError(
        "meetingFinalizedGuard",
        `Blocked action on finalized meeting ${_id} with status ${status}`,
        req
      );

      return throwConflictError(
        res,
        `Meeting is already finalized`,
        `Cannot perform this action. Meeting status is ${status}.`
      );
    }

    logWithTime(`✅ Meeting finalized guard passed for ${_id}`);
    return next();

  } catch (error) {
    logMiddlewareError("meetingFinalizedGuard", `Internal error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};


module.exports = {
  meetingStatusGuardMiddleware,
  meetingFinalizedGuardMiddleware
};
