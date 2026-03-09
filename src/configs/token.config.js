const { getMyEnv, getMyEnvAsNumber } = require("@/utils/env.util");


module.exports = {
  expiryTimeOfAccessToken: getMyEnvAsNumber("ACCESS_TOKEN_EXPIRY"),
  expiryTimeOfRefreshToken: getMyEnvAsNumber("REFRESH_TOKEN_EXPIRY"),
  secretCodeOfAccessToken: getMyEnv("ACCESS_TOKEN_SECRET_CODE"),
  secretCodeOfRefreshToken: getMyEnv("REFRESH_TOKEN_SECRET_CODE"),
  expiryTimeOfResetToken: getMyEnvAsNumber("RESET_TOKEN_EXPIRY"),
  expiryTimeOfVerificationToken: getMyEnvAsNumber("VERIFICATION_TOKEN_EXPIRY"),

  // JWT Payload Structure - Required fields for token validation
  // Supports both old (uid, did) and new (id, adminId, deviceId) naming
  tokenPayloads: ["uid", "did", "exp", "iat"]
};