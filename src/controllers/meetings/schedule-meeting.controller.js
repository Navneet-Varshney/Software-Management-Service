// controllers/meetings/schedule-meeting.controller.js

const { scheduleMeetingService } = require("@services/meetings");
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
 * POST /meetings/:meetingId/schedule
 * Schedule a meeting (transition from DRAFT to SCHEDULED)
 *
 * AUTHORIZATION:
 * - User must be meeting FACILITATOR OR project OWNER
 *
 * EXPECTS from middleware:
 * - req.meeting: Meeting document
 * - req.project: Project document
 * - req.participant: { role } - User's role in meeting
 * - req.stakeholder: { role } - User's role in project
 * - req.body: { scheduledAt, meetingLink, meetingPassword?, platform?, expectedDuration? }
 */
const scheduleMeetingController = async (req, res) => {
    try {
        const { scheduledAt, meetingLink, meetingPassword, platform, expectedDuration } = req.body;
        const { meeting, project, participant, stakeholder } = req;

        logWithTime(
            `📍 [scheduleMeetingController] Scheduling meeting: ${meeting._id} | ${getLogIdentifiers(req)}`
        );

        // ── Authorization check ────────────────────────────────────────────
        const isFacilitator = participant?.role === ParticipantTypes.FACILITATOR;
        const isAllowedProjectRole = stakeholder?.role === ProjectRoleTypes.OWNER || stakeholder?.role === ProjectRoleTypes.MANAGER;

        if (!isFacilitator && !isAllowedProjectRole) {
            logWithTime(
                `⛔ [scheduleMeetingController] Unauthorized: Not facilitator or project OWNER/MANAGER | ${getLogIdentifiers(req)}`
            );
            return throwAccessDeniedError(res, "You don't have permission to schedule this meeting");
        }

        // ── Expected Duration Validation ────────────────────────────
        if (expectedDuration !== undefined) {
            if (
                typeof expectedDuration !== "number" ||
                expectedDuration < 15 ||
                expectedDuration > 480
            ) {
                logWithTime(
                    `⛔ [scheduleMeetingController] Invalid expectedDuration: ${expectedDuration} | ${getLogIdentifiers(req)}`
                );
                return throwBadRequestError(
                    res,
                    "expectedDuration must be a number between 15 and 480 minutes"
                );
            }
        }

        // ── Call service ───────────────────────────────────────────────────
        const result = await scheduleMeetingService(
            meeting,
            project,
            {
                scheduledAt,
                meetingLink,
                meetingPassword,
                platform,
                expectedDuration
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
            logWithTime(`❌ [scheduleMeetingController] ${result.message} | ${getLogIdentifiers(req)}`);

            if (result.errorCode === CONFLICT) {
                return throwBadRequestError(res, result.message);
            }

            return throwBadRequestError(res, result.message);
        }

        // ── Return success response ────────────────────────────────────────
        logWithTime(
            `✅ [scheduleMeetingController] Meeting scheduled successfully | ${getLogIdentifiers(req)}`
        );
        return sendMeetingUpdatedSuccess(res, result.meeting);

    } catch (error) {
        logWithTime(
            `❌ [scheduleMeetingController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`
        );
        return throwInternalServerError(res, error);
    }
};

module.exports = { scheduleMeetingController };
