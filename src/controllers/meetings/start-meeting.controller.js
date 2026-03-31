// controllers/meetings/start-meeting.controller.js

const { startMeetingService } = require("@services/meetings");
const {
  throwBadRequestError,
  throwInternalServerError,
  throwAccessDeniedError,
  getLogIdentifiers
} = require("@/responses/common/error-handler.response");
const { sendMeetingUpdatedSuccess } = require("@/responses/success/meeting.response");
const { logWithTime } = require("@utils/time-stamps.util");
const { ParticipantTypes, ProjectRoleTypes } = require("@configs/enums.config");

/**
 * POST /meetings/:meetingId/start
 * Start a meeting (transition from SCHEDULED to ONGOING)
 *
 * AUTHORIZATION:
 * - User must be meeting FACILITATOR OR project OWNER
 *
 * EXPECTS from middleware:
 * - req.meeting: Meeting document
 * - req.project: Project document
 * - req.participant: { role } - User's role in meeting
 * - req.stakeholder: { role } - User's role in project
 */
const startMeetingController = async (req, res) => {
  try {
    const { meeting, project, participant, stakeholder } = req;

    logWithTime(
      `📍 [startMeetingController] Starting meeting: ${meeting._id} | ${getLogIdentifiers(req)}`
    );

    // ── Authorization check ────────────────────────────────────────────
    const isFacilitator = participant?.role === ParticipantTypes.FACILITATOR;
    const isAllowedProjectRole = stakeholder?.role === ProjectRoleTypes.OWNER || stakeholder?.role === ProjectRoleTypes.MANAGER;

    if (!isFacilitator && !isAllowedProjectRole) {
      logWithTime(
        `⛔ [startMeetingController] Unauthorized: Not facilitator or project owner | ${getLogIdentifiers(req)}`
      );
      return throwAccessDeniedError(res, "You don't have permission to start this meeting");
    }

    // ── Call service ───────────────────────────────────────────────────
    const result = await startMeetingService(
      meeting,
      project,
      req.admin.adminId,
      {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    );

    // ── Handle error response ──────────────────────────────────────────
    if (!result.success) {
      logWithTime(`❌ [startMeetingController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Return success response ────────────────────────────────────────
    logWithTime(
      `✅ [startMeetingController] Meeting started successfully | ${getLogIdentifiers(req)}`
    );
    return sendMeetingUpdatedSuccess(res, result.meeting);

  } catch (error) {
    logWithTime(
      `❌ [startMeetingController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { startMeetingController };
