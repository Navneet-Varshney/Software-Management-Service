// services/validations/get-validation.service.js

const { ProjectModel } = require("../../models");
const { ValidationModel } = require("../../models");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const getValidationService = async ({ projectId }) => {
  try {
    // Check project exists
    const project = await ProjectModel.findById(projectId);
    if (!project) {
      return {
        success: false,
        message: "Project not found",
        errorCode: NOT_FOUND,
      };
    }

    // Get validation
    const validation = await ValidationModel.findOne({
      projectId,
      isDeleted: false,
    });

    if (!validation) {
      return {
        success: false,
        message: "Validation not found",
        errorCode: NOT_FOUND,
      };
    }

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
