// services/negotiations/get-negotiation.service.js

const { ProjectModel } = require("../../models");
const { NegotiationModel } = require("../../models");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const getNegotiationService = async ({ projectId }) => {
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

    // Get negotiation
    const negotiation = await NegotiationModel.findOne({
      projectId,
      isDeleted: false,
    });

    if (!negotiation) {
      return {
        success: false,
        message: "Negotiation not found",
        errorCode: NOT_FOUND,
      };
    }

    return {
      success: true,
      message: "Negotiation retrieved successfully",
      negotiation,
    };
  } catch (error) {
    console.error("[getNegotiationService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to get negotiation",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { getNegotiationService };
