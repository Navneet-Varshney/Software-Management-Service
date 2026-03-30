// services/validations/list-validations.service.js

const { ProjectModel } = require("../../models");
const { ValidationModel } = require("../../models");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const listValidationsService = async ({
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
    const totalCount = await ValidationModel.countDocuments({
      projectId,
      isDeleted: false,
    });

    // Get validations
    const validations = await ValidationModel.find({
      projectId,
      isDeleted: false,
    })
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 });

    return {
      success: true,
      message: "Validations retrieved successfully",
      validations,
      pagination: {
        totalCount,
        pageNumber,
        pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    };
  } catch (error) {
    console.error("[listValidationsService] Error:", error);
    return {
      success: false,
      message: error.message || "Failed to list validations",
      errorCode: INTERNAL_ERROR,
    };
  }
};

module.exports = { listValidationsService };
