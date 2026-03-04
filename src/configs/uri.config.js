// Base path of all APIs (can be changed in one place if needed)
const BASE_PATH = "/software-management-service";

// API versioning (helps us move from /v1 to /v2 easily)
const API_VERSION = "/api/v1";

// API Prefix that is Base Path + API Version
const API_PREFIX = `${BASE_PATH}${API_VERSION}`;

const INTERNAL_BASE = `${API_PREFIX}/internal`;  // /software-management-service/api/v1/internal

module.exports = {
    INTERNAL_BASE: INTERNAL_BASE,
    INTERNAL_ROUTES: {
        CREATE_SUPER_ADMIN: `/bootstrap/create-super-admin`, // /software-management-service/api/v1/internal/bootstrap/create-super-admin
        PROVIDE_HEALTH_CHECK_TO_AUTH_SERVICE: `/auth/health`, // /software-management-service/api/v1/internal/auth/health
        PROVIDE_HEALTH_CHECK_TO_ADMIN_PANEL_SERVICE: `/admin-panel/health` // /software-management-service/api/v1/internal/admin-panel/health
    }
};