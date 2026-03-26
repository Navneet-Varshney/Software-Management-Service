// middlewares/fast/fetch-fast.middleware.js

const { ElicitationModel } = require("@models/elicitation.model");
const { isValidMongoID } = require("@utils/id-validators.util");
const {
  throwMissingFieldsError,
  throwBadRequestError,
  throwDBResourceNotFoundError,
  throwInternalServerError,
  logMiddlewareError,
} = require("@/responses/common/error-handler.response");
const { logWithTime } = require("@/utils/time-stamps.util");

/**
 * fetchFastMiddleware
 *
 * Validates the `:fastId` route param, fetches the FAST meeting (elicitation with mode FAST) from DB,
 * and attaches it to `req.fast` for downstream middlewares and controllers.
 *
 * Returns 400 if fastId is missing or malformed.
 * Returns 404 if no FAST meeting exists with that id.
 * Returns 400 if the FAST meeting is soft-deleted (isDeleted === true).
 */
const fetchFastMiddleware = async (req, res, next) => {
  try {
    const fastId = req?.params?.fastId || req?.body?.fastId;

    // ── 1. Param presence ────────────────────────────────────────────
    if (!fastId) {
      return throwMissingFieldsError(res, ["fastId"]);
    }

    // ── 2. Format validation ─────────────────────────────────────────
    if (!isValidMongoID(fastId)) {
      return throwBadRequestError(
        res,
        "Invalid fastId format",
        "fastId must be a valid MongoDB ObjectId string."
      );
    }

    // ── 3. DB lookup ─────────────────────────────────────────────────
    const fast = await ElicitationModel.findById(fastId);

    if (!fast) {
      return throwDBResourceNotFoundError(res, "FAST meeting");
    }

    // ── 4. Soft-delete guard ─────────────────────────────────────────
    if (fast.isDeleted) {
      return throwBadRequestError(
        res,
        "FAST meeting is deleted",
        "This FAST meeting has been deleted and cannot be accessed."
      );
    }

    // ── 5. Attach and continue ───────────────────────────────────────
    logWithTime(`✅ FAST meeting fetched successfully: ${fast._id}`);
    req.fast = fast;
    return next();

  } catch (error) {
    logMiddlewareError("fetchFastMiddleware", `Internal error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { fetchFastMiddleware };
