const { logWithTime } = require("@utils/time-stamps.util");
const { isValidCustomId } = require("@utils/id-validators.util");
const { ClientModel } = require("@models/client.model");
const { logServiceTrackerEvent } = require("@services/audit/service-tracker.service");
const { SYSTEM_LOG_EVENTS, STATUS_TYPES, SERVICE_NAMES } = require("@configs/system-log-events.config");

/**
 * Update Client Organizations Service
 * Updates client's organization memberships and blocked status
 * 
 * @param {string} clientId - The custom client ID (USR format)
 * @param {string} removedOrgId - Organization ID to remove (optional)
 * @param {string} addedOrgId - Organization ID to add (optional)
 * @param {string} adminId - The adminId who executed the update
 * @param {string} requestId - The request ID for tracking
 * @returns {Promise<Object>} - { success: boolean, message: string, data?: Object, type?: string }
 */
const updateClientOrganizationsService = async (
  clientId,
  removedOrgId,
  addedOrgId,
  adminId,
  requestId
) => {
  try {
    // Step 1: Validate clientId format
    if (!clientId || !isValidCustomId(clientId)) {
      logWithTime(`❌ Invalid clientId format: ${clientId}`);
      
      logServiceTrackerEvent({
        serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
        eventType: SYSTEM_LOG_EVENTS.INTERNAL_API_CALL,
        action: "UPDATE_CLIENT_ORGANIZATIONS_VALIDATION_FAILED",
        status: STATUS_TYPES.FAILURE,
        description: `Client organizations update failed: Invalid clientId format (${clientId})`,
        targetId: clientId,
        executedBy: adminId,
        metadata: { reason: "Invalid clientId format" }
      });

      return {
        success: false,
        type: "BadRequest",
        message: "Invalid clientId format. Please provide a valid custom ID."
      };
    }

    // Step 2: Find the client
    const query = { clientId, isDeleted: false };
    
    logWithTime(`🔍 Searching for Client with clientId: ${clientId}`);
    
    const clientToUpdate = await ClientModel.findOne(query).lean();

    // Step 3: Handle not found scenario
    if (!clientToUpdate) {
      logWithTime(`⚠️ Client not found or deleted: ${clientId}`);
      
      logServiceTrackerEvent({
        serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
        eventType: SYSTEM_LOG_EVENTS.INTERNAL_API_CALL,
        action: "UPDATE_CLIENT_ORGANIZATIONS_NOT_FOUND",
        status: STATUS_TYPES.FAILURE,
        description: `Client organizations update failed: Client not found with clientId ${clientId}`,
        targetId: clientId,
        executedBy: adminId,
        metadata: { reason: "Client not found" }
      });

      return {
        success: false,
        type: "Conflict",
        message: "Client not found or deleted."
      };
    }

    // Step 4: Prepare organization update operations
    logWithTime(`📦 Updating organizations for Client: ${clientId}`);
    
    const updateData = {};
    const organizationChanges = {};

    // Remove organization if specified
    if (removedOrgId) {
      updateData.$pull = { organizations: removedOrgId };
      organizationChanges.removed = removedOrgId;
      logWithTime(`  ➖ Removing organization: ${removedOrgId}`);
    }

    // Add organization if specified
    if (addedOrgId) {
      if (!updateData.$push) {
        updateData.$push = {};
      }
      updateData.$push.organizations = addedOrgId;
      organizationChanges.added = addedOrgId;
      logWithTime(`  ➕ Adding organization: ${addedOrgId}`);
    }

    // Step 5: Perform the update
    const updateQuery = { clientId };
    
    const updatedClient = await ClientModel.findOneAndUpdate(
      updateQuery,
      updateData,
      { new: true, lean: true }
    );

    // Step 6: Log success to ServiceTracker
    logWithTime(`✅ Successfully updated organizations for Client: ${clientId}`);
    
    logServiceTrackerEvent({
      serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
      eventType: SYSTEM_LOG_EVENTS.INTERNAL_API_CALL,
      action: "UPDATE_CLIENT_ORGANIZATIONS_SUCCESS",
      status: STATUS_TYPES.SUCCESS,
      description: `Client organizations updated for clientId ${clientId}`,
      targetId: clientId,
      executedBy: adminId,
      metadata: { 
        organizations: updatedClient.organizations || [],
        changes: organizationChanges,
        requestId
      }
    });

    return {
      success: true,
      data: updatedClient,
      message: "Client organizations updated successfully."
    };

  } catch (err) {
    logWithTime(`💥 Error in updateClientOrganizationsService: ${err.message}`);
    
    // Log the error to ServiceTracker
    logServiceTrackerEvent({
      serviceName: SERVICE_NAMES.ADMIN_PANEL_SERVICE,
      eventType: SYSTEM_LOG_EVENTS.SYSTEM_ERROR,
      action: "UPDATE_CLIENT_ORGANIZATIONS_ERROR",
      status: STATUS_TYPES.ERROR,
      description: `Unexpected error during client organizations update: ${err.message}`,
      targetId: clientId || "unknown",
      executedBy: adminId,
      metadata: { 
        error: err.message,
        stack: err.stack
      }
    });

    return {
      success: false,
      type: "InternalServerError",
      message: err.message || "An error occurred while updating client organizations."
    };
  }
};

module.exports = {
  updateClientOrganizationsService
};
