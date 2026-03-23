// services/product-vision/delete-product-vision.service.js

const { InceptionModel } = require("@models/inception.model");
const { versionControlService } = require("@services/common/version.service");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");

/**
 * Deletes product vision by clearing it.
 * Deletion reason (if provided) is added to the activity log description.
 *
 * @param {Object} params
 * @param {Object} params.inception - The Inception document
 * @param {Object} params.project - The Project document (for criticality check and audit)
 * @param {string} params.deletionReasonDescription - Reason for deletion (optional, added to activity log)
 * @param {string} params.deletedBy - USR-prefixed custom ID of the admin deleting
 * @param {Object} params.auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, message?: string, error?: string }}
 */
const deleteProductVisionService = async ({
  inception,
  project,
  deletionReasonDescription = null,
  deletedBy,
  auditContext,
}) => {
  try {
    // ── Store old inception for audit ────────────────────────────────────────────
    const oldInception = inception.toObject ? inception.toObject() : inception;

    // ── Check if product vision already null ────────────────────────────────────────
    if (!oldInception.productVision) {
      return { success: true, message: "Product vision is already empty" };
    }

    // ── Clear product vision ────────────────────────────────────────────────────────
    inception.productVision = null;
    inception.updatedBy = deletedBy;

    const updatedInception = await inception.save();

    // ── Version control ────────────────────────────────────────────────────
    await versionControlService(
      inception,
      `Product vision deleted — version bump`,
      deletedBy,
      auditContext
    );

    // ── Activity tracker ─────────────────────────────────────────────────────
    const { user: auditUser, device, requestId } = auditContext || {};
    const { oldData, newData } = prepareAuditData(oldInception, updatedInception);

    let activityMessage = `Product vision deleted by ${deletedBy}`;
    if (deletionReasonDescription) {
      activityMessage = `Product vision deleted by ${deletedBy} — Reason: ${deletionReasonDescription}`;
    }

    logActivityTrackerEvent(
      auditUser,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.DELETE_PRODUCT_VISION,
      activityMessage,
      {
        oldData,
        newData,
        adminActions: { targetId: inception._id?.toString() },
      }
    );

    return { success: true };

  } catch (error) {
    logWithTime(`❌ [deleteProductVisionService] Error caught while deleting product vision`);
    errorMessage(error);

    if (error.name === "ValidationError") {
      logWithTime(`[deleteProductVisionService] Validation Error Details: ${JSON.stringify(error.errors)}`);
      return { success: false, message: "Validation error", error: error.message };
    }

    logWithTime(`[deleteProductVisionService] Full error: ${error.toString()}`);
    return { success: false, message: "Internal error while deleting product vision", error: error.message };
  }
};

module.exports = { deleteProductVisionService };
