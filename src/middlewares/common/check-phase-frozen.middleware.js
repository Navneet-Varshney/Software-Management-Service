// middlewares/common/check-phase-frozen.middleware.js

const { createCheckPhaseFrozenMiddleware } = require("@/middlewares/factory/check-phase-frozen.middleware-factory");

/**
 * Phase-Frozen Check Middlewares
 * 
 * Each middleware checks if the respective phase (attached to req)
 * is frozen before allowing the request to proceed.
 * 
 * If phase.isFrozen === true, returns 403 Forbidden (throwAccessDeniedError)
 * 
 * Usage in routes:
 *   router.post(
 *     "/inceptions/:inceptionId/update",
 *     fetchInceptionMiddleware,
 *     checkInceptionNotFrozen,
 *     updateInceptionController
 *   );
 */

const checkInceptionNotFrozen = createCheckPhaseFrozenMiddleware("inception");
const checkElicitationNotFrozen = createCheckPhaseFrozenMiddleware("elicitation");
const checkElaborationNotFrozen = createCheckPhaseFrozenMiddleware("elaboration");
const checkNegotiationNotFrozen = createCheckPhaseFrozenMiddleware("negotiation");
const checkSpecificationNotFrozen = createCheckPhaseFrozenMiddleware("specification");
const checkValidationNotFrozen = createCheckPhaseFrozenMiddleware("validation");

module.exports = {
  checkInceptionNotFrozen,
  checkElicitationNotFrozen,
  checkElaborationNotFrozen,
  checkNegotiationNotFrozen,
  checkSpecificationNotFrozen,
  checkValidationNotFrozen
};
