// services/projects/update-project.service.js

const { ProjectModel } = require("@models/project.model");
const { logActivityTrackerEvent } = require("@services/audit/activity-tracker.service");
const { prepareAuditData } = require("@utils/audit-data.util");
const { ACTIVITY_TRACKER_EVENTS } = require("@configs/tracker.config");
const { generateVersion } = require("@/utils/version.util");
const { ProjectStatus, ProjectCategoryTypes } = require("@/configs/enums.config");
const { isValidMongoID } = require("@/utils/id-validators.util");


const updateProjectService = async (existingProject, updates) => {
  try {

    const blockedStatuses = [ProjectStatus.COMPLETED, ProjectStatus.ABORTED];
    if (blockedStatuses.includes(existingProject.projectStatus)) {
      return {
        success: false,
        message: `Cannot update a ${existingProject.projectStatus} project`,
      };
    }

    // 2. Build update payload — only include supplied fields
    const allowedFields = [
      "name",
      "description",
      "problemStatement",
      "goal",
      "expectedBudget",
      "expectedTimelineMonths"
    ];

    const updatePayload = {};

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        updatePayload[field] = updates[field];
      }
    });

    // 2b. Org IDs management based on project category
    let hasOrgChanges = false;

    if (existingProject.projectCategory === ProjectCategoryTypes.INDIVIDUAL) {
      if ((updates.addedOrgIds || []).length > 0 || (updates.removedOrgIds || []).length > 0) {
        return {
          success: false,
          message: "Data integrity violation: individual projects cannot contain organisations"
        };
      }
    } else if (existingProject.projectCategory === ProjectCategoryTypes.ORGANIZATION) {
      // Ignore orgId fields

      // In Single Org Projects, orgIds is considered as immutable after creation. 
      // To change the org association, the project must be recreated. 
      // This is to maintain data integrity and avoid complex cascading updates that could arise from changing the org association of an existing project.

      if (updates.orgId || updates.addedOrgIds || updates.removedOrgIds) {
        return {
          success: false,
          message: "Organization association cannot be modified for single-organization projects"
        };
      }

    } else if (existingProject.projectCategory === ProjectCategoryTypes.MULTI_ORGANIZATION) {
      const existingOrgIds = (existingProject.orgIds || []).map(o => o.toString());

      const addedOrgIds = [...new Set((updates.addedOrgIds || []).map(id => id.toString()))]
        .filter(id => isValidMongoID(id))
        .filter(id => !existingOrgIds.includes(id));

      const removedOrgIds = [...new Set((updates.removedOrgIds || []).map(id => id.toString()))]
        .filter(id => isValidMongoID(id))
        .filter(id => existingOrgIds.includes(id));

      const removedSet = new Set(removedOrgIds);

      const finalAdded = addedOrgIds.filter(id => !removedSet.has(id));

      const currentSet = new Set(existingOrgIds);

      finalAdded.forEach(id => currentSet.add(id));
      removedOrgIds.forEach(id => currentSet.delete(id));

      const finalOrgIds = [...currentSet];

      if (finalOrgIds.length < 1) {
        return { success: false, message: "A multi-organization project must retain at least one organisation" }
      }

      if (finalAdded.length > 0 || removedOrgIds.length > 0) {
        updatePayload.orgIds = finalOrgIds;
        hasOrgChanges = true;
      }
    }

    // 2a. Bail out early if none of the supplied values actually differ
    const hasActualChanges = hasOrgChanges || allowedFields.some((field) => {
      if (updatePayload[field] === undefined) return false;
      return updatePayload[field] !== existingProject[field];
    });

    if (!hasActualChanges) {
      return { success: true, message: "No changes detected, Project Document remains unchanged" };
    }

    // 3. Increment version only when something genuinely changed
    updatePayload.version = generateVersion(1, existingProject.version);

    // 4. Stamp updatedBy and updation reason
    updatePayload.updatedBy = updates.updatedBy;
    updatePayload.projectUpdationReasonType = updates.projectUpdationReasonType;
    updatePayload.projectUpdationReasonDescription = updates.projectUpdationReasonDescription || null;

    // 5. Persist – { new: true } returns the updated document
    const updatedProject = await ProjectModel.findByIdAndUpdate(
      existingProject._id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    );

    // ── Fire-and-forget: activity tracking ──────────────────────────
    const { admin, device, requestId } = updates.auditContext || {};
    const { oldData, newData } = prepareAuditData(existingProject, updatedProject);

    logActivityTrackerEvent(
      admin,
      device,
      requestId,
      ACTIVITY_TRACKER_EVENTS.UPDATE_PROJECT,
      `Project '${updatedProject.name}' (${existingProject._id}) updated to ${updatedProject.version} by ${updates.updatedBy}`,
      {
        oldData,
        newData,
        adminActions: { targetId: existingProject._id },
      }
    );

    return {
      success: true,
      oldProject: existingProject,
      project: updatedProject,
    };
  } catch (error) {
    if (error.name === "ValidationError") {
      return {
        success: false,
        message: "Validation error",
        error: error.message,
      };
    }

    return {
      success: false,
      message: "Internal error while updating project",
      error: error.message,
    };
  }
};

module.exports = { updateProjectService };
