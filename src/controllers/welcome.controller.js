const { logWithTime } = require("@/utils/time-stamps.util");
const { OK } = require("@configs/http-status.config");

/**
 * Controller: Welcome (Dummy)
 * 
 * @route GET /welcome
 * @access Public
 * 
 * @description Simple welcome endpoint for testing
 * 
 * @returns {200} Welcome message
 */

const welcomeController = async (req, res) => {
    try {
        logWithTime(` ✅ Welcome endpoint hit from User: ${req?.admin?.adminId || req?.client?.clientId}`);
        return res.status(OK).json({
            success: true,
            message: "Welcome to Software Management Service! 🚀",
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            error: err.message
        });
    }
};

module.exports = {
    welcomeController
};
