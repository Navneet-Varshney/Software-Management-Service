
const { customIdRegex } = require("@/configs/regex.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { PhaseDeletionReason } = require("@/configs/enums.config");
const { descriptionLength, titleLength } = require("@/configs/fields-length.config");
const mongoose = require("mongoose");

const elicitationSchema = new mongoose.Schema({

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DB_COLLECTIONS.PROJECTS,
    required: true,
    index: true
  },

  isFrozen: {
    type: Boolean,
    default: false
  },

  startedAt: {
    type: Date,
    default: null
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

  cycleNumber: {
    type: Number,
    required: true,
    default: 0
  },

  version: {
    type: String,
    default: "v1.0"
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
  }

}, { timestamps: true });

elicitationSchema.index({ projectId: 1, isDeleted: 1 });
elicitationSchema.index({ projectId: 1, cycleNumber: -1, isDeleted: 1 });

const ElicitationModel = mongoose.model(DB_COLLECTIONS.ELICITATIONS, elicitationSchema);

module.exports = {
  ElicitationModel
};