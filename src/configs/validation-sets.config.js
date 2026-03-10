/**
 * CENTRALIZED FIELD DEFINITIONS CONFIG
 * 
 * Single Source of Truth for:
 * - Required fields per endpoint/action
 * - Validation rules mapping
 * - Field-level metadata
 * 
 * Benefits:
 * 1. Ek jagah change karein, sab jagah reflect ho
 * 2. Type-safe through enum-like structure
 * 3. Automatic derivation of required-fields arrays
 * 4. Direct mapping to validation rules
 */

const { validationRules } = require("./validation.config");

/**
 * Field Metadata Structure:
 * {
 *   field: 'fieldName',           // Field identifier
 *   required: true/false,         // Is this field required?
 *   validation: validationRule,   // Link to validation.config.js rule
 *   description: 'Field purpose'  // Optional documentation
 * }
 */

// AUTH ENDPOINTS FIELD DEFINITIONS

const FieldDefinitions = {
    CREATE_ADMIN: {
        ADMIN_TYPE: {
            field: "adminType",
            required: true,
            validation: validationRules.adminType,
            description: "Type of admin (SUPER_ADMIN, SUB_ADMIN)"
        }
    },
    CREATE_PROJECT: {

    },
    UPDATE_PROJECT: {

    }
};

module.exports = {
  FieldDefinitions
};