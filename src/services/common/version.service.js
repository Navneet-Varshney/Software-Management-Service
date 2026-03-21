// services/common/version.service.js

const { Phases, ValidationPhaseStatus } = require("@configs/enums.config");
const { InceptionModel } = require("@models/inception.model");
const { ElicitationModel } = require("@models/elicitation.model");
const { ElaborationModel } = require("@models/elaboration.model");
const { NegotiationModel } = require("@models/negotiation.model");
const { SpecificationModel } = require("@models/specification.model");
const { ValidationModel } = require("@models/validation.model");
const { generateVersion } = require("@utils/version.util");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { logWithTime } = require("@utils/time-stamps.util");

/**
 * Maps each Phase to its Mongoose model.
 * MANAGEMENT has no dedicated phase document model.
 */
const PHASE_MODEL_MAP = {
  [Phases.INCEPTION]: InceptionModel,
  [Phases.ELICITATION]: ElicitationModel,
  [Phases.ELABORATION]: ElaborationModel,
  [Phases.NEGOTIATION]: NegotiationModel,
  [Phases.SPECIFICATION]: SpecificationModel,
  [Phases.VALIDATION]: ValidationModel,
  [Phases.MANAGEMENT]: null,
};

/**
 * Reusable version control service.
 *
 * Logic:
 *  1. Determine the current phase from the project document.
 *  2. Check if the most-recent ValidationModel doc for this project
 *     has status = COMPLETED and isApproved = true.
 *     → YES: increment cycleNumber, generate "vN.0", create NEW phase doc.
 *     → NO : find existing phase doc, bump the decimal only (update in-place).
 *  3. Fire VERSION_CHANGE activity-tracker event (fire-and-forget).
 *
 * @param {Object} project      - Mongoose project document ({ _id, currentPhase, ... })
 * @param {string} action       - Human-readable description used as activity-tracker description
 * @param {string} performedBy  - USR-prefixed custom userId of the actor
 * @param {Object} auditContext - { admin, device, requestId }
 * @returns {{ success: boolean, newVersion?: string, message?: string }}
 */
const versionControlService = async (project, action, performedBy, auditContext) => {
  try {
    const currentPhase = project.currentPhase;
    const projectId = project._id;

    const PhaseModel = PHASE_MODEL_MAP[currentPhase];

    if (!PhaseModel) {
      // MANAGEMENT phase has no document model – skip silently
      logWithTime(`[versionControlService] No phase model for "${currentPhase}". Skipping.`);
      return { success: true, newVersion: null };
    }

    // ── Step 1: Check if last ValidationModel doc is COMPLETED + Approved ────
    const latestValidation = await ValidationModel
      .findOne({ projectId, isDeleted: false })
      .sort({ cycleNumber: -1 })
      .lean();

    const shouldIncrementCycle =
      latestValidation !== null &&
      latestValidation.status === ValidationPhaseStatus.COMPLETED &&
      latestValidation.isApproved === true;

    // ── Step 2: Compute new version & update / create phase doc ──────────────
    let newVersion;
    let newCycleNumber;

    if (shouldIncrementCycle) {
      // Full cycle increment → brand-new phase document
      newCycleNumber = latestValidation.cycleNumber + 1;
      newVersion = generateVersion(newCycleNumber, null); // "v<N>.0"

      await PhaseModel.create({
        projectId,
        cycleNumber: newCycleNumber,
        version: newVersion,
        createdBy: performedBy,
      });

      logWithTime(
        `[versionControlService] New cycle ${newCycleNumber} → phase: ${currentPhase}, version: ${newVersion}`
      );

    } else {
      // Same cycle → find (or bootstrap) existing doc and bump decimal
      const existingPhaseDoc = await PhaseModel
        .findOne({ projectId, isDeleted: false })
        .sort({ cycleNumber: -1 })
        .select("_id cycleNumber version");

      if (existingPhaseDoc) {
        newCycleNumber = existingPhaseDoc.cycleNumber;
        newVersion = generateVersion(newCycleNumber, existingPhaseDoc.version); // "v<N>.<M+1>"

        await PhaseModel.findByIdAndUpdate(
          existingPhaseDoc._id,
          { $set: { version: newVersion, updatedBy: performedBy } },
          { new: true, runValidators: true }
        );

        logWithTime(
          `[versionControlService] Version bump → phase: ${currentPhase}, version: ${newVersion}`
        );
      } else {
        // Bootstrap: no existing doc — first version for this phase/cycle
        newCycleNumber = 0;
        newVersion = generateVersion(0, null); // "v0.0"

        await PhaseModel.create({
          projectId,
          cycleNumber: newCycleNumber,
          version: newVersion,
          createdBy: performedBy,
        });

        logWithTime(
          `[versionControlService] Bootstrap phase doc → phase: ${currentPhase}, version: ${newVersion}`
        );
      }
    }

    // ── Step 3: Activity tracker (fire-and-forget) ────────────────────────────
    const { admin, device, requestId } = auditContext || {};
    logActivityTrackerEvent(
      user,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.PHASE_VERSION_CHANGE,
      action,
      {
        newData: {
          phase: currentPhase,
          cycleNumber: newCycleNumber,
          version: newVersion,
        },
        adminActions: { targetId: projectId?.toString() },
      }
    );

    return { success: true, newVersion };

  } catch (error) {
    logWithTime(`[versionControlService] Error: ${error.message}`);
    return { success: false, message: error.message };
  }
};

module.exports = { versionControlService };
