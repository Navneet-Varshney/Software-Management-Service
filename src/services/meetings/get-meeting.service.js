// services/meetings/get-meeting.service.js

const { logWithTime } = require("@utils/time-stamps.util");
const { filterMeetingDataByUserType } = require("@utils/data-filter.util");

/**
 * Get Single Meeting Service
 * 
 * Returns meeting details for authenticated participant.
 * Filters data based on user type (admin vs client).
 * (Participant check already validated by middleware)
 *
 * @param {Object} meeting - Meeting document (already validated by middleware)
 * @param {Object} user - User object (req.admin or req.client)
 * @returns {{ success: true, meeting } | { success: false, message }}
 */
const getMeetingService = async (meeting, user) => {
  try {
    logWithTime(`[getMeetingService] Fetching meeting: ${meeting._id}`);

    const meetingObj = meeting.toObject ? meeting.toObject() : meeting;
    
    // Check if user is admin
    const isAdmin = !!user?.adminId;
    
    // Filter meeting data based on user type
    const filteredMeeting = filterMeetingDataByUserType(meetingObj, isAdmin);

    return {
      success: true,
      meeting: filteredMeeting
    };

  } catch (error) {
    logWithTime(`❌ [getMeetingService] Error: ${error.message}`);
    return {
      success: false,
      message: error.message || "Failed to retrieve meeting"
    };
  }
};

module.exports = { getMeetingService };
