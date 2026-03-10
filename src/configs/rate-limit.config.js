// configs/rate-limit.config.js

module.exports = {
  perDevice: {
    malformedRequest: {
      maxRequests: 20,
      windowMs: 60 * 1000, // 1 minute
      prefix: "malformed_request",
      reason: "Malformed request",
      message: "Too many malformed requests. Fix your payload and try again later."
    },

    unknownRoute: {
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
      prefix: "unknown_route",
      reason: "Unknown route access",
      message: "Too many invalid or unauthorized requests."
    }

  },

  perUserAndDevice: {
    welcomeAdmin: {
      maxRequests: 5,
      windowMs: 60 * 1000, // 1 minute
      prefix: "welcome_admin",
      reason: "Welcome admin endpoint abuse",
      message: "Too many requests to welcome admin endpoint. Please try again later."
    },
    welcomeClient: {
      maxRequests: 5,
      windowMs: 60 * 1000, // 1 minute
      prefix: "welcome_client",
      reason: "Welcome client endpoint abuse",
      message: "Too many requests to welcome client endpoint. Please try again later."
    },
    createProject: {
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
      prefix: "create_project",
      reason: "Create project endpoint abuse",
      message: "Too many requests to create project endpoint. Please try again later."
    },
    updateProject: {
      maxRequests: 10,
      windowMs: 60 * 1000, // 1 minute
      prefix: "update_project",
      reason: "Update project endpoint abuse",
      message: "Too many requests to update project endpoint. Please try again later."
    }
  }
};