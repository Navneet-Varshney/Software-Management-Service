// services/product-vision/get-product-vision.service.js

/**
 * Admin/full view of product vision in inception.
 *
 * @param {Object} inception
 * @returns {{ success: boolean, inception?: Object, message?: string, error?: string }}
 */
const getProductVisionAdminService = async (inception) => {
  try {
    const inceptionData = inception?.toObject ? inception.toObject() : inception;
    return { success: true, inception: inceptionData };
  } catch (error) {
    return { success: false, message: "Internal error while fetching product vision", error: error.message };
  }
};

/**
 * Restricted product vision view for client/stakeholder access.
 * Only shows productVision and basic inception info.
 *
 * @param {Object} inception
 * @returns {{ success: boolean, inception?: Object, message?: string, error?: string }}
 */
const getProductVisionClientService = async (inception) => {
  try {
    const inceptionData = inception?.toObject ? inception.toObject() : inception;

    return {
      success: true,
      inception: {
        inceptionId: inceptionData._id,
        productVision: inceptionData.productVision,
        createdAt: inceptionData.createdAt,
      },
    };
  } catch (error) {
    return { success: false, message: "Internal error while fetching product vision", error: error.message };
  }
};

module.exports = {
  getProductVisionAdminService,
  getProductVisionClientService,
};
