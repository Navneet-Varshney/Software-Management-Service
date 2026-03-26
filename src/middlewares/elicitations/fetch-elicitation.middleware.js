// middlewares/elicitations/fetch-elicitation.middleware.js

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
 * fetchElicitationMiddleware
 *
 * Validates the `:elicitationId` route param, fetches the elicitation from DB,
 * and attaches it to `req.elicitation` for downstream middlewares and controllers.
 *
 * Returns 400 if elicitationId is missing or malformed.
 * Returns 404 if no elicitation exists with that id.
 * Returns 400 if the elicitation is soft-deleted (isDeleted === true).
 */
const fetchElicitationMiddleware = async (req, res, next) => {
  try {
    const elicitationId = req?.params?.elicitationId || req?.body?.elicitationId;

    // ── 1. Param presence ────────────────────────────────────────────
    if (!elicitationId) {
      return throwMissingFieldsError(res, ["elicitationId"]);
    }

    // ── 2. Format validation ─────────────────────────────────────────
    if (!isValidMongoID(elicitationId)) {
      return throwBadRequestError(
        res,
        "Invalid elicitationId format",
        "elicitationId must be a valid MongoDB ObjectId string."
      );
    }

    // ── 3. DB lookup ─────────────────────────────────────────────────
    const elicitation = await ElicitationModel.findById(elicitationId);

    if (!elicitation) {
      return throwDBResourceNotFoundError(res, "Elicitation");
    }

    // ── 4. Soft-delete guard ─────────────────────────────────────────
    if (elicitation.isDeleted) {
      return throwBadRequestError(
        res,
        "Elicitation is deleted",
        "This elicitation has been deleted and cannot be accessed."
      );
    }

    // ── 5. Attach and continue ───────────────────────────────────────
    logWithTime(`✅ Elicitation fetched successfully: ${elicitation._id}`);
    req.elicitation = elicitation;
    return next();

  } catch (error) {
    logMiddlewareError("fetchElicitationMiddleware", `Internal error: ${error.message}`, req);
    return throwInternalServerError(res, error);
  }
};

module.exports = { fetchElicitationMiddleware };
