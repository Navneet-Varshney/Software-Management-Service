// controllers/scopes/link-scope-to-hlf.controller.js

const { linkScopeToHlfService } = require("@services/scopes/link-scope-to-hlf.service");
const {
  throwConflictError,
  throwInternalServerError,
  getLogIdentifiers,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * PATCH /scopes/link/:scopeId/:hlfId
 * Link a scope to an HLF feature.
 */
const linkScopeToHlfController = async (req, res) => {
  try {
    const { scope, hlf, inception } = req;

    logWithTime(
      `📍 [linkScopeToHlfController] Linking scope ${scope._id} to HLF ${hlf._id} | ${getLogIdentifiers(req)}`
    );

    // ── Call service ──────────────────────────────────────────────────
    const result = await linkScopeToHlfService({
      scope,
      hlf,
      inception,
      featureId: hlf._id?.toString(),
      linkedBy: req.admin.adminId,
      auditContext: {
        user: req.admin,
        device: req.device,
        requestId: req.requestId
      }
    });

    // ── Handle error response ─────────────────────────────────────────
    if (!result.success) {
      logWithTime(
        `❌ [linkScopeToHlfController] ${result.message} | ${getLogIdentifiers(req)}`
      );
      return throwConflictError(res, result.message);
    }

    // ── Return success response ───────────────────────────────────────
    logWithTime(`✅ [linkScopeToHlfController] Scope linked to HLF successfully | ${getLogIdentifiers(req)}`);
    return res.status(200).json({
      success: true,
      message: "Scope linked to HLF successfully.",
      data: { scope: result.scope }
    });

  } catch (error) {
    logWithTime(`❌ [linkScopeToHlfController] Unexpected error: ${error.message} | ${getLogIdentifiers(req)}`);
    return throwInternalServerError(res, error);
  }
};

module.exports = { linkScopeToHlfController };
