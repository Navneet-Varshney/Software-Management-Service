// controllers/meetings/reschedule-meeting.controller.js

const { rescheduleMeetingService } = require("@services/meetings");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwAccessDeniedError,
  getLogIdentifiers
} = require("@/responses/common/error-handler.response");
const { sendMeetingUpdatedSuccess } = require("@/responses/success/meeting.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { CONFLICT } = require("@configs/http-status.config");
const { ParticipantTypes, ProjectRoleTypes } = require("@configs/enums.config");

/**
 * PATCH /meetings/:meetingId/reschedule
 * Reschedule a meeting (must be in SCHEDULED status)
 *
 * AUTHORIZATION:
 * - User must be meeting FACILITATOR OR project OWNER
 *
 * EXPECTS from middleware:
 * - req.meeting: Meeting document
 * - req.project: Project document
 * - req.participant: { role } - User's role in meeting
 * - req.stakeholder: { role } - User's role in project
 * - req.body: { scheduledAt?, meetingLink?, meetingPassword?, platform? }
 */
const rescheduleMeetingController = async (req, res) => {
  try {
    const { scheduledAt, meetingLink, meetingPassword, platform } = req.body;
    const { meeting, project, participant, stakeholder } = req;

    logWithTime(
      `📍 [rescheduleMeetingController] Rescheduling meeting: ${meeting._id} | ${getLogIdentifiers(req)}`
    );

    // ── Authorization check ────────────────────────────────────────────
    const isFacilitator = participant?.role === ParticipantTypes.FACILITATOR;
    const isAllowedProjectRole = stakeholder?.role === ProjectRoleTypes.OWNER || stakeholder?.role === ProjectRoleTypes.MANAGER;

    if (!isFacilitator && !isAllowedProjectRole) {
      logWithTime(
        `⛔ [rescheduleMeetingController] Unauthorized: Not facilitator or project owner | ${getLogIdentifiers(req)}`
      );
      return throwAccessDeniedError(res, "You don't have permission to reschedule this meeting");
    }

    // ── Call service ───────────────────────────────────────────────────
    const result = await rescheduleMeetingService(
      meeting,
      project,
      {
        scheduledAt,
        meetingLink,
        meetingPassword,
        platform
      },
      req.admin.adminId,
      {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    );

    // ── Handle error response ──────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [rescheduleMeetingController] ${result.message} | ${getLogIdentifiers(req)}`);

      if (result.errorCode === CONFLICT) {
        return throwBadRequestError(res, result.message);
      }

      return throwBadRequestError(res, result.message);
    }

    // ── Return success response ────────────────────────────────────────
    logWithTime(
      `✅ [rescheduleMeetingController] Meeting rescheduled successfully | ${getLogIdentifiers(req)}`
    );
    return sendMeetingUpdatedSuccess(res, result.meeting);

  } catch (error) {
    logWithTime(
      `❌ [rescheduleMeetingController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { rescheduleMeetingController };
