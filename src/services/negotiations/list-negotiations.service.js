// services/negotiations/list-negotiations.service.js

const { ProjectModel } = require("../../models");
const { NegotiationModel } = require("../../models");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const listNegotiationsService = async ({
  projectId,
  pageNumber = 1,
  pageSize = 10,
}) => {
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

    // Calculate skip
    const skip = (pageNumber - 1) * pageSize;

    // Get total count
    const totalCount = await NegotiationModel.countDocuments({
      projectId,
      isDeleted: false,
    });

    // Get negotiations
    const negotiations = await NegotiationModel.find({
      projectId,
      isDeleted: false,
    })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: "Negotiations retrieved successfully",
      negotiations,
      pagination: {
        totalCount,
        pageNumber,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    console.error("[listNegotiationsService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to list negotiations",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { listNegotiationsService };
