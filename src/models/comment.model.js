const { DB_COLLECTIONS } = require('@/configs/db-collections.config');
const { ScopeTypes, RequirementTypes, CommentOtherEntityTypes } = require('@/configs/enums.config');
const { descriptionLength } = require('@/configs/fields-length.config');
const { customIdRegex } = require('@/configs/regex.config');
const mongoose = require('mongoose');
const allowedEntityTypes = [DB_COLLECTIONS.REQUIREMENTS, DB_COLLECTIONS.SCOPES, DB_COLLECTIONS.INCEPTIONS, DB_COLLECTIONS.HIGH_LEVEL_FEATURES];
const specifiedEntityTypes = Object.values(ScopeTypes).concat(Object.values(CommentOtherEntityTypes)).concat(Object.values(RequirementTypes));

const CommentSchema = new mongoose.Schema({
  entityType: { type: String, enum: allowedEntityTypes, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId,refPath: 'entityType', required: true },
  subEntityType: { type: String, enum: specifiedEntityTypes },
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: DB_COLLECTIONS.COMMENTS, default: null },
  commentText: { type: String,  trim: true, minlength: descriptionLength.min, maxlength: descriptionLength.max, required: true },
  createdBy: { type: String, required: true, match: customIdRegex },
  updatedBy: { type: String, match: customIdRegex, default: null },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  deletedBy: { type: String, match: customIdRegex, default: null }
}, {
    timestamps: true
});

CommentSchema.index({ entityType: 1, entityId: 1, isDeleted: 1, createdAt: -1 });
CommentSchema.index({ parentCommentId: 1, isDeleted: 1 });
CommentSchema.index({ parentCommentId: 1, isDeleted: 1, createdAt: 1 });

const CommentModel = mongoose.model(DB_COLLECTIONS.COMMENTS, CommentSchema);

module.exports = {
    CommentModel
}