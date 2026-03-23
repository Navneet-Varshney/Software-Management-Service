// responses/success/product-vision.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * 201 – Product vision created successfully.
 */
const sendProductVisionCreatedSuccess = (res, inception) => {
  return res.status(CREATED).json({
    success: true,
    message: "Product vision created successfully.",
    data: { inception },
  });
};

/**
 * 200 – Product vision updated successfully.
 */
const sendProductVisionUpdatedSuccess = (res, inception) => {
  return res.status(OK).json({
    success: true,
    message: "Product vision updated successfully.",
    data: { inception },
  });
};

/**
 * 200 – Product vision deleted successfully.
 */
const sendProductVisionDeletedSuccess = (res) => {
  return res.status(OK).json({
    success: true,
    message: "Product vision deleted successfully.",
  });
};

/**
 * 200 – Product vision fetched successfully.
 */
const sendProductVisionFetchedSuccess = (res, inception) => {
  return res.status(OK).json({
    success: true,
    message: "Product vision fetched successfully.",
    data: { inception },
  });
};

module.exports = {
  sendProductVisionCreatedSuccess,
  sendProductVisionUpdatedSuccess,
  sendProductVisionDeletedSuccess,
  sendProductVisionFetchedSuccess,
};
