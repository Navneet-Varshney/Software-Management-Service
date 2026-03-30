// services/specifications/list-specifications.service.js

const { ProjectModel } = require("../../models");
const { SpecificationModel } = require("../../models");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const listSpecificationsService = async ({
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
    const totalCount = await SpecificationModel.countDocuments({
      projectId,
      isDeleted: false,
    });

    // Get specifications
    const specifications = await SpecificationModel.find({
      projectId,
      isDeleted: false,
    })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: "Specifications retrieved successfully",
      specifications,
      pagination: {
        totalCount,
        pageNumber,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    console.error("[listSpecificationsService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to list specifications",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { listSpecificationsService };
