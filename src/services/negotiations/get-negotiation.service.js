// services/negotiations/get-negotiation.service.js

const { NegotiationModel } = require("../../models");
const { NOT_FOUND, INTERNAL_ERROR } = require("@configs/http-status.config");

const getNegotiationService = async (negotiation) => {
  try {
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
