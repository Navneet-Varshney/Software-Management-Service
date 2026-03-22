const { customIdRegex } = require("@/configs/regex.config");
const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { descriptionLength, productVisionLength } = require("@/configs/fields-length.config");
const mongoose = require("mongoose");

const inceptionSchema = new mongoose.Schema({

  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: DB_COLLECTIONS.PROJECTS,
    required: true,
    index: true
  },

  cycleNumber: {
    type: Number,
    required: true,
    default: 0
  },

  productVision: {
    type: String,
    trim: true,
    minlength: productVisionLength.min,
    maxlength: productVisionLength.max,
    default: null
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
  }

}, { timestamps: true });

inceptionSchema.index(
  { projectId: 1, cycleNumber: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
inceptionSchema.index({ projectId: 1, isDeleted: 1 });
inceptionSchema.index({ projectId: 1, cycleNumber: -1, isDeleted: 1 });

const InceptionModel = mongoose.model(DB_COLLECTIONS.INCEPTIONS, inceptionSchema);

module.exports = {
  InceptionModel
};