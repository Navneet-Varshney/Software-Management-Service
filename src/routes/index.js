const { INTERNAL_BASE } = require("@/configs/uri.config");
const { internalRouter } = require("./internal.routes");

module.exports = (app) => {
  // Internal service-to-service routes (protected by service token)
  app.use(INTERNAL_BASE, internalRouter);

  // Add other routes here as needed
  // app.use("/api/admins", adminRoutes);
  // app.use("/api/auth", authRoutes);
};