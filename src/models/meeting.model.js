const { customIdRegex } = require("@/configs/regex.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { descriptionLength, titleLength } = require("@/configs/fields-length.config");
const { ParticipantTypes, MeetingPlatformTypes, MeetingStatuses, Phases, MeetingGroups } = require("@/configs/enums.config");
const mongoose = require("mongoose");

const MeetingEntiityTypes = Object.freeze({
  ELICITATION: Phases.ELICITATION,
  NEGOTIATION: Phases.NEGOTIATION
});

const participantSchema = new mongoose.Schema({

  userId: {
    type: String,
    match: customIdRegex,
    required: true
  },

  role: {
    type: String,
    enum: Object.values(ParticipantTypes),
    default: ParticipantTypes.PARTICIPANT
  },

  roleDescription: {
    type: String,
    default: null // optional (SCRIBE, OBSERVER etc. for UI only)
  },

  addedBy: {
    type: String,
    match: customIdRegex,
    immutable: true,
    required: true
  },

  addedAt: {
    type: Date,
    default: Date.now
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  removedBy: {
    type: String,
    match: customIdRegex,
    default: null
  },

  removedAt: {
    type: Date,
    default: null
  }

}, { _id: true });


const meetingSchema = new mongoose.Schema({

  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityType',
    required: true,
    index: true
  },

  entityType: {
    type: String,
    enum: Object.values(MeetingEntiityTypes),
    default: MeetingEntiityTypes.ELICITATION
  },

  platform: {
    type: String,
    enum: Object.values(MeetingPlatformTypes),
    default: MeetingPlatformTypes.GOOGLE_MEET
  },

  status: {
    type: String,
    enum: Object.values(MeetingStatuses),
    default: MeetingStatuses.DRAFT
  },

  scheduledAt: {
    type: Date,
    default: null
  },

  startedAt: {
    type: Date,
    default: null
  },

  endedAt: {
    type: Date,
    default: null
  },

  meetingLink: {
    type: String,
    default: null
  },

  meetingPassword: {
    type: String,
    default: null
  },

  meetingGroup: {
    type: String,
    enum: Object.values(MeetingGroups),
    default: MeetingGroups.GENERAL
  },

  facilitatorId: {
    type: String,
    match: customIdRegex,
    required: true
  },

  participants: {
    type: [participantSchema],
    default: []
  },

  title: {
    type: String,
    trim: true,
    minlength: titleLength.min,
    maxlength: titleLength.max,
    default: null
  },

  description: {
    type: String,
    trim: true,
    minlength: descriptionLength.min,
    maxlength: descriptionLength.max,
    default: null
  },

  createdBy: {
    type: String,
    match: customIdRegex,
    required: true
  },

  updatedBy: {
    type: String,
    match: customIdRegex,
    default: null
  },

  isDeleted: {
    type: Boolean,
    default: false
  },

  isScheduleFrozen: {
    type: Boolean,
    default: false
  },

  deletedAt: {
    type: Date,
    default: null
  },

  deletedBy: {
    type: String,
    match: customIdRegex,
    default: null
  },

}, { timestamps: true });

const MeetingModel = mongoose.model(DB_COLLECTIONS.MEETINGS, meetingSchema);

module.exports = {
  MeetingModel
}