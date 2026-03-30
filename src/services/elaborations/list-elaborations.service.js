// services/elaborations/list-elaborations.service.js

const { ProjectModel } = require("../../models");
const { ElaborationModel } = require("../../models");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const listElaborationsService = async ({
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
    const totalCount = await ElaborationModel.countDocuments({
      projectId,
      isDeleted: false,
    });

    // Get elaborations
    const elaborations = await ElaborationModel.find({
      projectId,
      isDeleted: false,
    })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: "Elaborations retrieved successfully",
      elaborations,
      pagination: {
        totalCount,
        pageNumber,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    console.error("[listElaborationsService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to list elaborations",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { listElaborationsService };
