const { DB_COLLECTIONS } = require('@/configs/db-collections.config');
const { titleLength } = require('@/configs/fields-length.config');
const { customIdRegex } = require('@/configs/regex.config');
const mongoose = require('mongoose');

const FeatureRequirementMappingSchema = new mongoose.Schema({
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
    // Optional: Just in case you want to note why they are linked 
    // (e.g., "Blocked By", "Cross-Functional Dependency")
    relationshipNotes: { 
        type: String, 
        trim: true, 
        default: null,
        minlength: titleLength.min,
        maxlength: titleLength.max 
    },
    createdBy: { type: String, required: true, match: customIdRegex },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String, match: customIdRegex, default: null }
}, {
    timestamps: true
});

// 🧠 INDEX 1: Compound Unique Index
// Ek hi requirement aur feature ka same combination do baar map na ho (bina delete hue)
FeatureRequirementMappingSchema.index(
    { featureId: 1, requirementId: 1 }, 
    { unique: true, partialFilterExpression: { isDeleted: false } }
);

// 🧠 INDEX 2: Reverse Lookup Index
// Fast query for: "Yeh requirement aur kin features ko impact kar rahi hai?"
FeatureRequirementMappingSchema.index({ requirementId: 1, isDeleted: 1, createdAt: -1 });

// 🧠 INDEX 3: Feature Lookup Index
// Fast query for: "Is feature se linked cross-functional requirements kaunsi hain?"
FeatureRequirementMappingSchema.index({ featureId: 1, isDeleted: 1, createdAt: -1 });

const FeatureRequirementMappingModel = mongoose.model(
    DB_COLLECTIONS.FEATURE_REQUIREMENT_MAPPINGS, // Ensure this exists in your config
    FeatureRequirementMappingSchema
);

module.exports = {
    FeatureRequirementMappingModel
};