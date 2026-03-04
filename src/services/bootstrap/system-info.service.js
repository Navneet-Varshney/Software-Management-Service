/**
 * Section 6: Microservice Configuration
 */
function logMicroserviceConfig() {
    const isMicroservice = getEnvSafe("MAKE_IT_MICROSERVICE", "false");
    const isEnabled = isMicroservice.toLowerCase() === "true";

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    logWithTime("🔧 MICROSERVICE CONFIGURATION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (isEnabled) {
        const instanceName = getEnvSafe("SERVICE_INSTANCE_NAME", "auth-service-01");
        const adminPanelUrl = getEnvSafe("ADMIN_PANEL_SERVICE_URL", "Not set");
        const softwareManagementUrl = getEnvSafe("SOFTWARE_MANAGEMENT_SERVICE_URL", "Not set");

        console.log(`   Mode:                     ✅ MICROSERVICE MODE`);
        console.log(`   Service Instance:         ${instanceName}`);
        console.log(`   Admin Panel Service:      ${adminPanelUrl}`);
        console.log(`   Software Mgmt Service:    ${softwareManagementUrl}`);
        console.log(`   Service Token Secret:     ${maskSecret(process.env.CUSTOM_AUTH_SERVICE_TOKEN_SECRET || "")}`);
        console.log(`   Redis Key Salt:           ${maskSecret(process.env.REDIS_KEY_SALT || "")}`);
        console.log(`\n   Features:`);
        console.log(`      ✅ Redis Session Management`);
        console.log(`      ✅ Service-to-Service Auth`);
        console.log(`      ✅ Token Rotation Scheduler`);
        console.log(`      ✅ Internal API Routes`);
    } else {
        console.log(`   Mode:                     🏢 MONOLITHIC MODE`);
        console.log(`\n   Features:`);
        console.log(`      ❌ No Redis Session Management`);
        console.log(`      ❌ No Service-to-Service Auth`);
        console.log(`      ❌ No Token Rotation`);
        console.log(`      ❌ Internal Routes Disabled`);
    }
}

async function logSystemConfiguration() {
    try {
        console.log("\n");
        console.log("═══════════════════════════════════════════════════════════════════════");
        logWithTime("📋 SYSTEM CONFIGURATION REPORT");
        console.log("═══════════════════════════════════════════════════════════════════════");

        logMicroserviceConfig();

        console.log("\n═══════════════════════════════════════════════════════════════════════");
        logWithTime("✅ SYSTEM CONFIGURATION REPORT COMPLETE");
        console.log("═══════════════════════════════════════════════════════════════════════\n");
        return true;
    } catch (error) {
        console.error("⚠️ Failed to log system configuration:", error.message);
        return false;
    }
}

module.exports = {
  logSystemConfiguration
};