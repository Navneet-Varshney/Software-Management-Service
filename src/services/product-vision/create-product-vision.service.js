// services/product-vision/create-product-vision.service.js

const { InceptionModel } = require("@models/inception.model");
const { versionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");

/**
 * Creates product vision for an inception document.
 *
 * @param {Object} params
 * @param {Object} params.inception - The Inception document
 * @param {string} params.productVision - Product vision content (required)
 * @param {string} params.createdBy - USR-prefixed custom ID of the admin creating the product vision
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, inception?: Object, message?: string, error?: string }}
 */
const createProductVisionService = async ({
  inception,
  productVision,
  createdBy,
  auditContext,
}) => {
  try {
    // ── Guard: prevent overwriting existing product vision ──────────────────
    if (inception.productVision) {
      return { success: false, message: "Product vision already exists" };
    }

    // ── Store old inception for comparison ────────────────────────────────────────
    const oldInception = inception.toObject ? inception.toObject() : { ...inception };

    // ── Create product vision ────────────────────────────────────────────────────────
    inception.productVision = productVision.trim();
    inception.updatedBy = createdBy;

    const updatedInception = await inception.save();

    // ── Version control ────────────────────────────────────────────────────
    const project = await require("@models/project.model").ProjectModel.findOne({
      _id: inception.projectId,
      isDeleted: false
    });

    if (project) {
      await versionControlService(
        inception,
        `Product vision created — version bump`,
        createdBy,
        auditContext
      );
    }

    // ── Activity tracker ──────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldInception, updatedInception);

    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.CREATE_PRODUCT_VISION,
      `Product vision created for inception ${inception._id?.toString()} by ${createdBy}`,
      {
        oldData,
        newData,
        adminActions: { targetId: inception._id?.toString() },
      }
    );

    return { success: true, inception: updatedInception };

  } catch (error) {
    logWithTime(`❌ [createProductVisionService] Error caught while creating product vision`);
    errorMessage(error);

    if (error.name === "ValidationError") {
      logWithTime(`[createProductVisionService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }

    logWithTime(`[createProductVisionService] Full error: ${error.toString()}`);
    return { success: false, message: "Internal error while creating product vision", error: error.message };
  }
};

module.exports = { createProductVisionService };
