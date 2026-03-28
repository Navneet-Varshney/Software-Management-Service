const { customIdRegex } = require("@/configs/regex.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { PhaseDeletionReason, ElicitationModes } = require("@/configs/enums.config");
const { descriptionLength } = require("@/configs/fields-length.config");
const mongoose = require("mongoose");

const elicitationSchema = new mongoose.Schema({

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DB_COLLECTIONS.PROJECTS,
    required: true,
    index: true
  },

  meetingIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: DB_COLLECTIONS.MEETINGS
  }],

  allowParallelMeetings: {
    type: Boolean,
    default: false
  },

  version: {
    major: {
      type: Number, // equivalent to cycleNumber
      default: 1
    },
    minor: {
      type: Number, // updates inside cycle
      default: 0
    }
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

  deletedAt: {
    type: Date,
    default: null
  },

  deletedBy: {
    type: String,
    match: customIdRegex,
    default: null
  },

  elicitationMode: {
    type: String,
    enum: Object.values(ElicitationModes),
    default: ElicitationModes.OPEN
  },

  deletionReasonType: {
    type: String,
    enum: Object.values(PhaseDeletionReason),
    default: null
  },

  deletionReasonDescription: {
    type: String,
    default: null,
    minlength: descriptionLength.min,
    maxlength: descriptionLength.max
  },

  isFrozen: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

elicitationSchema.index({ projectId: 1, isDeleted: 1 });
elicitationSchema.index({ projectId: 1, "version.major": -1, isDeleted: 1 });

const ElicitationModel = mongoose.model(DB_COLLECTIONS.ELICITATIONS, elicitationSchema);

module.exports = {
  ElicitationModel
};