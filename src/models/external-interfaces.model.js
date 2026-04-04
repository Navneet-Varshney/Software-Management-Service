const { DB_COLLECTIONS } = require("@/configs/db-collections.config");
const { PriorityLevels, EIInterfaceTypes, EIAuthTypes, EIFrequencyTypes, EIInteractionTypes } = require("@/configs/enums.config");
const { descriptionLength } = require("@/configs/fields-length.config");
const { customIdRegex } = require("@/configs/regex.config");
const mongoose = require("mongoose");

const ExternalInterfaceSchema = new mongoose.Schema({

    // 1. Title / Name → REQUIRED
    title: {
        type: String,
        required: true,
        trim: true
    },

    // 2. Description → REQUIRED
    description: {
        type: String,
        minlength: descriptionLength.min,
        maxlength: descriptionLength.max,
        required: true,
        trim: true
    },

    // 3. Interface Type → REQUIRED
    interfaceType: {
        type: String,
        enum: EIInterfaceTypes,
        required: true
    },

    // 4. Source System → REQUIRED
    sourceSystem: {
        type: String,
        required: true
    },

    // 5. Target System → REQUIRED
    targetSystem: {
        type: String,
        required: true
    },

    // 6. Interaction Type → REQUIRED
    interactionType: {
        type: String,
        enum: Object.values(EIInteractionTypes),
        required: true
    },

    // 7. Data Flow Description → REQUIRED
    dataFlowDescription: {
        type: String,
        required: true
    },

    // 8. Input Data Structure → OPTIONAL
    inputSchema: {
        type: mongoose.Schema.Types.Mixed
    },

    // 9. Output Data Structure → OPTIONAL
    outputSchema: {
        type: mongoose.Schema.Types.Mixed
    },

    // 10. Trigger / Event → REQUIRED
    trigger: {
        type: String,
        required: true
    },

    // 11. Frequency → OPTIONAL
    frequency: {
        type: String,
        enum: Object.values(EIFrequencyTypes)
    },

    // 12. Protocol / Technology → OPTIONAL
    protocol: {
        type: String
    },

    // 13. Authentication / Authorization → OPTIONAL
    authType: {
        type: String,
        enum: Object.values(EIAuthTypes)
    },

    // 14. Security Requirements → OPTIONAL
    security: {
        encryption: {
            type: Boolean,
            default: false
        },
        compliance: {
            type: [String] // e.g. ["GDPR", "HIPAA"]
        }
    },

    // 15. Constraints → OPTIONAL
    constraints: {
        latency: String,       // e.g. "200ms"
        throughput: String,    // e.g. "1000 req/sec"
        sizeLimit: String,     // e.g. "10MB"
        sla: String            // e.g. "99.9%"
    },

    // 16. Error Handling → OPTIONAL
    errorHandling: {
        type: String
    },

    // 17. Dependencies → OPTIONAL
    dependencies: [{
        type: String
    }],

    // 18. Priority / Criticality → OPTIONAL
    priority: {
        type: String,
        enum: Object.values(PriorityLevels),
        default: PriorityLevels.MEDIUM
    },

    // 20. Created By → REQUIRED
    createdBy: {
        type: String,
        match: customIdRegex,
        required: true
    },

    // 21. Last Updated By → OPTIONAL
    updatedBy: {
        type: String,
        match: customIdRegex,
        default: null
    },

    // 22. Soft Delete Fields
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

    isFrozen: {
        type: Boolean,
        default: false
    },

    assigneeId: {
        type: String,
        match: customIdRegex,
        default: null
    }

}, {
    timestamps: true // 22. createdAt, updatedAt
});

module.exports = mongoose.model(DB_COLLECTIONS.EXTERNAL_INTERFACES, ExternalInterfaceSchema);