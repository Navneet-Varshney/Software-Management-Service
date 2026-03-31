// controllers/meetings/freeze-meeting.controller.js

const { freezeMeetingService } = require("@services/meetings");
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
 * POST /meetings/:meetingId/freeze
 * Freeze a meeting (prevent further modifications)
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
const freezeMeetingController = async (req, res) => {
  try {
    const { meeting, project, participant, stakeholder } = req;

    logWithTime(
      `📍 [freezeMeetingController] Freezing meeting: ${meeting._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ───────────────────────────────────────────────────
    const result = await freezeMeetingService(
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
      logWithTime(`❌ [freezeMeetingController] ${result.message} | ${getLogIdentifiers(req)}`);
      return throwBadRequestError(res, result.message);
    }

    // ── Return success response ────────────────────────────────────────
    logWithTime(
      `✅ [freezeMeetingController] Meeting frozen successfully | ${getLogIdentifiers(req)}`
    );
    return sendMeetingUpdatedSuccess(res, result.meeting);

  } catch (error) {
    logWithTime(
      `❌ [freezeMeetingController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
    );
    return throwInternalServerError(res, error);
  }
};

module.exports = { freezeMeetingController };
