// services/validations/get-validation.service.js

const { INTERNAL_ERROR } = require("@configs/http-status.config");

const getValidationService = async (validation) => {
  try {

    return {
      success: true,
      message: "Validation retrieved successfully",
      validation,
    };
  } catch (error) {
    console.error("[getValidationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to get validation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { getValidationService };
