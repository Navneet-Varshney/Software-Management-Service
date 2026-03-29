// services/meetings/list-meetings.service.js

const { MeetingModel } = require("@models/meeting.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { filterMeetingDataByUserType } = require("@utils/data-filter.util");

/**
 * List Meetings Service
 * 
 * Returns only meetings where user is an active participant.
 * Filters data based on user type (admin vs client).
 * Supports optional filters and pagination.
 *
 * @param {Object} params
 * @param {Object} params.user - User object (req.admin or req.client)
 * @param {string} [params.entityId] - Optional entity filter
 * @param {string} [params.entityType] - Optional entity type filter
 * @param {number} [params.page] - Pagination page (default: 1)
 * @param {number} [params.limit] - Results per page (default: 10)
 * @returns {{ success: true, meetings, pagination } | { success: false, message }}
 */
const listMeetingsService = async ({
  user,
  entityId,
  entityType,
  page = 1,
  limit = 10
}) => {
  try {
    // Extract userId from user object
    const userId = user?.adminId || user?.clientId;
    
    if (!userId) {
      logWithTime(`❌ [listMeetingsService] User ID not found in user object`);
      return {
        success: false,
        message: "User ID is required to list meetings"
      };
    }
    
    logWithTime(`[listMeetingsService] Fetching meetings for user: ${userId}`);

    // Build query: User must be an active participant
    const query = {
      participants: {
        $elemMatch: {
          userId: userId,
          isDeleted: false
        }
      }
    };

    // Optional filters
    if (entityId) query.entityId = entityId;
    if (entityType) query.entityType = entityType;

    // Calculate pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 10);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const meetings = await MeetingModel
      .find(query)
      .sort({ scheduledAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const total = await MeetingModel.countDocuments(query);
    const pages = Math.ceil(total / limitNum);

    // Check if user is admin
    const isAdmin = !!user?.adminId;
    
    // Filter meetings data based on user type
    const filteredMeetings = filterMeetingDataByUserType(meetings, isAdmin);

    logWithTime(`✅ [listMeetingsService] Found ${filteredMeetings.length} meetings`);

    return {
      success: true,
      meetings: filteredMeetings,
      pagination: { total, page: pageNum, limit: limitNum, pages }
    };

  } catch (error) {
    logWithTime(`❌ [listMeetingsService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message || "Failed to list meetings"
    };
  }
};

module.exports = { listMeetingsService };
