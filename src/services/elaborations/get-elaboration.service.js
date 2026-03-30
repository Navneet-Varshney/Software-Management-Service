// services/elaborations/get-elaboration.service.js

const { ProjectModel } = require("../../models");
const { ElaborationModel } = require("../../models");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const getElaborationService = async ({ projectId }) => {
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

    // Get elaboration
    const elaboration = await ElaborationModel.findOne({
      projectId,
      isDeleted: false,
    });

    if (!elaboration) {
      return {
        success: false,
        message: "Elaboration not found",
        errorCode: NOT_FOUND,
      };
    }

    return {
      success: true,
      message: "Elaboration retrieved successfully",
      elaboration,
    };
  } catch (error) {
    console.error("[getElaborationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to get elaboration",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { getElaborationService };
