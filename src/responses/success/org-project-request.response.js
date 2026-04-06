// responses/success/org-project-request.response.js

const { CREATED, OK } = require("@configs/http-status.config");

/**
 * Sends a 201 response after an organization project request is successfully created.
 *
 * @param {Object} res - Express response object
 * @param {Object} orgProjectRequest - Newly created organization project request document
 */
const sendOrgProjectRequestCreatedSuccess = (res, orgProjectRequest) => {
  return res.status(CREATED).json({
    success: true,
    message: "Organization project request created successfully.",
    data: {
      orgProjectRequest,
    },
  });
};

/**
 * Sends a 200 response after an organization project request is successfully updated.
 *
 * @param {Object} res - Express response object
 * @param {Object} orgProjectRequest - Updated organization project request document
 */
const sendOrgProjectRequestUpdatedSuccess = (res, orgProjectRequest) => {
  return res.status(OK).json({
    success: true,
    message: "Organization project request updated successfully.",
    data: { orgProjectRequest },
  });
};

/**
 * Sends a 200 response after an organization project request is successfully approved.
 *
 * @param {Object} res - Express response object
 * @param {Object} orgProjectRequest - Approved organization project request document
 */
const sendOrgProjectRequestApprovedSuccess = (res, orgProjectRequest) => {
  return res.status(OK).json({
    success: true,
    message: "Organization project request approved successfully.",
    data: { orgProjectRequest },
  });
};

/**
 * Sends a 200 response after an organization project request is successfully rejected.
 *
 * @param {Object} res - Express response object
 * @param {Object} orgProjectRequest - Rejected organization project request document
 */
const sendOrgProjectRequestRejectedSuccess = (res, orgProjectRequest) => {
  return res.status(OK).json({
    success: true,
    message: "Organization project request rejected successfully.",
    data: { orgProjectRequest },
  });
};

/**
 * Sends a 200 response after an organization project request is successfully withdrawn.
 *
 * @param {Object} res - Express response object
 * @param {Object} orgProjectRequest - Withdrawn organization project request document
 */
const sendOrgProjectRequestWithdrawnSuccess = (res, orgProjectRequest) => {
  return res.status(OK).json({
    success: true,
    message: "Organization project request withdrawn successfully.",
    data: { orgProjectRequest },
  });
};

/**
 * Sends a 200 response with a single organization project request's details.
 *
 * @param {Object} res - Express response object
 * @param {Object} orgProjectRequest - Organization project request document
 */
const sendOrgProjectRequestFetchedSuccess = (res, orgProjectRequest) => {
  return res.status(OK).json({
    success: true,
    message: "Organization project request fetched successfully.",
    data: { orgProjectRequest },
  });
};

/**
 * Sends a 200 response with a list of organization project requests.
 *
 * @param {Object} res - Express response object
 * @param {Object[]} orgProjectRequests - Array of organization project request documents
 * @param {number} total - Total count of requests
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 */
const sendOrgProjectRequestsListSuccess = (res, orgProjectRequests, total, page, limit) => {
  return res.status(OK).json({
    success: true,
    message: "Organization project requests retrieved successfully.",
    data: {
      orgProjectRequests,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    },
  });
};

module.exports = {
  sendOrgProjectRequestCreatedSuccess,
  sendOrgProjectRequestUpdatedSuccess,
  sendOrgProjectRequestApprovedSuccess,
  sendOrgProjectRequestRejectedSuccess,
  sendOrgProjectRequestWithdrawnSuccess,
  sendOrgProjectRequestFetchedSuccess,
  sendOrgProjectRequestsListSuccess,
};
