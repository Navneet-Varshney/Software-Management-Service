const { AdminModel } = require("@models/admin.model");
const { ClientModel } = require("@models/client.model");
const { TotalTypes } = require("@configs/enums.config");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Returns the appropriate Mongoose model based on entity type
 * 
 * @param {string} type - The entity type (TotalTypes.ADMIN, TotalTypes.USER, or TotalTypes.CLIENT)
 * @returns {Object} - Returns AdminModel for ADMIN type, UserModel for USER/CLIENT types
 * @throws {Error} - If type is invalid or not recognized
 */

const getModelByType = (type) => {
  try {
    if (type === TotalTypes.ADMIN) {
      logWithTime(`🔄 Selected AdminModel for type: ${type}`);
      return AdminModel;
    } else if (type === TotalTypes.CLIENT) {
      logWithTime(`🔄 Selected ClientModel for type: ${type}`);
      return ClientModel;
    } else {
      throw new Error(`Invalid type provided: ${type}. Expected one of: ${Object.values(TotalTypes).join(", ")}`);
    }
  } catch (err) {
    logWithTime(`❌ Error in getModelByType: ${err.message}`);
    throw err;
  }
};

module.exports = {
  getModelByType
};
