const { DB_COLLECTIONS } = require('@/configs/db-collections.config');
const { RelationTypes, ContributionTypes } = require('@/configs/enums.config');
const { descriptionLength } = require('@/configs/fields-length.config');
const { customIdRegex } = require('@/configs/regex.config');
const mongoose = require('mongoose');

const FeatureRequirementMappingSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DB_COLLECTIONS.PROJECTS,
        required: true,
        index: true
    },
    featureId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DB_COLLECTIONS.HIGH_LEVEL_FEATURES,
        required: true
    },
    requirementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: DB_COLLECTIONS.REQUIREMENTS,
        required: true
    },
    relationType: {
        type: String,
        enum: Object.values(RelationTypes),
        required: true
    },
    contributionType: {
        type: String,
        enum: Object.values(ContributionTypes),
        default: ContributionTypes.SUPPORTING
    },
    // Optional: Just in case you want to note why they are linked 
    // (e.g., "Blocked By", "Cross-Functional Dependency")
    relationshipNotes: {
        type: String,
        trim: true,
        default: null,
        minlength: descriptionLength.min,
        maxlength: descriptionLength.max
    },
    createdBy: { type: String, required: true, match: customIdRegex },
    updatedBy: { type: String, match: customIdRegex, default: null },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, match: customIdRegex, default: null }
}, {
    timestamps: true
});

// 🧠 INDEX 1: Compound Unique Index
// Ek hi requirement aur feature ka same combination do baar map na ho (bina delete hue)
FeatureRequirementMappingSchema.index(
  { projectId: 1, featureId: 1, requirementId: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

FeatureRequirementMappingSchema.index({
  projectId: 1,
  featureId: 1,
  isDeleted: 1
});

FeatureRequirementMappingSchema.index({
  projectId: 1,
  requirementId: 1,
  isDeleted: 1
});

const FeatureRequirementMappingModel = mongoose.model(
    DB_COLLECTIONS.FEATURE_REQUIREMENT_MAPPINGS, // Ensure this exists in your config
    FeatureRequirementMappingSchema
);

module.exports = {
    FeatureRequirementMappingModel
};