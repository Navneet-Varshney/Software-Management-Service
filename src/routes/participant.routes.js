const express = require("express");
const {
  participantControllers
} = require("@/controllers/participants");

const {
  participantMiddlewares
} = require("@/middlewares/participants");

const { PARTICIPANT_ROUTES } = require("@configs/uri.config");
const { baseAuthAdminMiddlewares, baseAuthClientOrAdminMiddlewares } = require("./middleware.gateway.routes");
const { projectMiddlewares } = require("@/middlewares/projects");
const { stakeholderMiddlewares } = require("@/middlewares/stakeholders");
const { meetingMiddlewares } = require("@/middlewares/meetings");
const {
  ADD_PARTICIPANT,
  REMOVE_PARTICIPANT,
  UPDATE_PARTICIPANT,
  GET_PARTICIPANT,
  LIST_PARTICIPANTS
} = PARTICIPANT_ROUTES;

const participantRouter = express.Router();

participantRouter.post(
  ADD_PARTICIPANT,[
    ...baseAuthAdminMiddlewares,

    // Meeting (from meetingId + entity)
    meetingMiddlewares.fetchMeetingMiddleware,
    
    // Project (derived from entity or meeting)
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,

    // Entity (from entityType)
    meetingMiddlewares.fetchEntityIdMiddleware,
    meetingMiddlewares.checkPhaseFrozenStatusMiddleware,

    // Stakeholder
    stakeholderMiddlewares.checkUserIsStakeholder,

    // Meeting validations
    meetingMiddlewares.meetingStatusGuardMiddleware,
    meetingMiddlewares.validateUserIsParticipantMiddleware,

    // Request validation
    participantMiddlewares.addParticipantPresenceMiddleware,
    participantMiddlewares.addParticipantValidationMiddleware
  ],
  participantControllers.addParticipantController
)

participantRouter.patch(
  REMOVE_PARTICIPANT,[
    ...baseAuthAdminMiddlewares,

    // Meeting (from meetingId + entity)
    meetingMiddlewares.fetchMeetingMiddleware,

    // Project (derived from entity or meeting)
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,

    // Entity (from entityType)
    meetingMiddlewares.fetchEntityIdMiddleware,
    meetingMiddlewares.checkPhaseFrozenStatusMiddleware,

    // Stakeholder
    stakeholderMiddlewares.checkUserIsStakeholder,

    // Meeting validations
    meetingMiddlewares.meetingStatusGuardMiddleware,
    meetingMiddlewares.validateUserIsParticipantMiddleware,

    // Request validation
    participantMiddlewares.removeParticipantPresenceMiddleware,
    participantMiddlewares.removeParticipantValidationMiddleware

  ],
  participantControllers.removeParticipantController
)

participantRouter.patch(
  UPDATE_PARTICIPANT ,[
    ...baseAuthAdminMiddlewares,

    // Meeting (from meetingId + entity)
    meetingMiddlewares.fetchMeetingMiddleware,

    // Project (derived from entity or meeting)
    projectMiddlewares.fetchProjectMiddleware,
    projectMiddlewares.activeProjectGuardMiddleware,

    // Entity (from entityType)
    meetingMiddlewares.fetchEntityIdMiddleware,
    meetingMiddlewares.checkPhaseFrozenStatusMiddleware,

    // Stakeholder
    stakeholderMiddlewares.checkUserIsStakeholder,

    // Meeting validations
    meetingMiddlewares.meetingStatusGuardMiddleware,
    meetingMiddlewares.validateUserIsParticipantMiddleware,

    // Request validation
    participantMiddlewares.updateParticipantPresenceMiddleware,
    participantMiddlewares.updateParticipantValidationMiddleware

  ],
  participantControllers.updateParticipantController
)

participantRouter.get(
  GET_PARTICIPANT, [
    ...baseAuthClientOrAdminMiddlewares,

    // Meeting (from meetingId + entity)
    meetingMiddlewares.fetchMeetingMiddleware,

    // Project (derived from entity or meeting)
    projectMiddlewares.fetchProjectMiddleware,

    // Entity (from entityType)
    meetingMiddlewares.fetchEntityIdMiddleware,

    // Stakeholder
    stakeholderMiddlewares.checkUserIsStakeholder,
    meetingMiddlewares.validateUserIsParticipantMiddleware
  ],
  participantControllers.getParticipantController
)

participantRouter.get(
  LIST_PARTICIPANTS, [
    ...baseAuthClientOrAdminMiddlewares,

    // Meeting (from meetingId + entity)
    meetingMiddlewares.fetchMeetingMiddleware,

    // Project (from projectId)
    projectMiddlewares.fetchProjectMiddleware,

    // Entity (from entityType)
    meetingMiddlewares.fetchEntityIdMiddleware,

    // Stakeholder
    stakeholderMiddlewares.checkUserIsStakeholder

  ],
  participantControllers.listParticipantsController
)

module.exports = {
  participantRouter
};
