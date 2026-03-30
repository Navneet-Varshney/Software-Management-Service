// services/specifications/get-specification.service.js

const { ProjectModel } = require("../../models");
const { SpecificationModel } = require("../../models");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const getSpecificationService = async ({ projectId }) => {
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

    // Get specification
    const specification = await SpecificationModel.findOne({
      projectId,
      isDeleted: false,
    });

    if (!specification) {
      return {
        success: false,
        message: "Specification not found",
        errorCode: NOT_FOUND,
      };
    }

    return {
      success: true,
      message: "Specification retrieved successfully",
      specification,
    };
  } catch (error) {
    console.error("[getSpecificationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to get specification",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { getSpecificationService };
