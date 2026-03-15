const { ProjectModel } = require("@models/project.model");
const { ProjectStatus } = require("@configs/enums.config");
const { isValidMongoID } = require("@/utils/id-validators.util");
const { detectCircularProjectLink } = require("@services/common/detect-circular-link.service");

/**
 * Normalize and validate list of Mongo ObjectIds
 */
const normalizeProjectIdList = (projectIds, fieldName) => {

    if (projectIds === undefined || projectIds === null) {
        return { success: true, projectIds: [] };
    }

    if (!Array.isArray(projectIds)) {
        return {
            success: false,
            message: `${fieldName} must be an array of MongoDB ObjectId strings`
        };
    }

    const trimmedIds = projectIds
        .map(id => (id === null || id === undefined ? "" : String(id).trim()))
        .filter(Boolean);

    const invalidIds = trimmedIds.filter(id => !isValidMongoID(id));

    if (invalidIds.length > 0) {
        return {
            success: false,
            message: `${fieldName} contains invalid MongoDB ObjectId values`
        };
    }

    return {
        success: true,
        projectIds: [...new Set(trimmedIds)]
    };
};


/**
 * Validate linked project IDs
 *
 * Handles both:
 *  - create (only addedLinkedProjectIds)
 *  - update (added + removed)
 */
const validateLinkedProjectIds = async ({
    projectId,
    addedLinkedProjectIds = [],
    removedLinkedProjectIds = []
}) => {

    const sourceProjectId = String(projectId);

    /* ───────── Normalize added IDs ───────── */

    const normalizedAdded = normalizeProjectIdList(
        addedLinkedProjectIds,
        "addedLinkedProjectIds"
    );

    if (!normalizedAdded.success) {
        return normalizedAdded;
    }

    const addedIds = normalizedAdded.projectIds;


    /* ───────── Normalize removed IDs ───────── */

    const normalizedRemoved = normalizeProjectIdList(
        removedLinkedProjectIds,
        "removedLinkedProjectIds"
    );

    if (!normalizedRemoved.success) {
        return normalizedRemoved;
    }

    const removedIds = normalizedRemoved.projectIds;


    /* ───────── Neutralize overlaps ───────── */

    const addedSet = new Set(addedIds);
    const removedSet = new Set(removedIds);

    const finalAdded = [...addedSet].filter(id => !removedSet.has(id));
    const finalRemoved = [...removedSet].filter(id => !addedSet.has(id));


    /* ───────── Self link protection ───────── */

    if (finalAdded.includes(sourceProjectId)) {
        return {
            success: false,
            message: "A project cannot be linked to itself"
        };
    }

    /* ───────── Nothing new to link ───────── */

    if (finalAdded.length === 0) {
        return {
            success: true,
            addedLinkedProjectIds: [],
            removedLinkedProjectIds: finalRemoved
        };
    }
    
    /* ───────── Fetch projects from DB ───────── */

    const linkedProjects = await ProjectModel.find(
        { _id: { $in: finalAdded } },
        { _id: 1, isDeleted: 1, isArchived: 1, projectStatus: 1 }
    ).lean();

    const foundIds = new Set(linkedProjects.map(p => String(p._id)));

    const missingIds = finalAdded.filter(id => !foundIds.has(id));

    if (missingIds.length > 0) {
        return {
            success: false,
            message: "One or more linked projects do not exist"
        };
    }

    /* ───────── Project state validation ───────── */

    const disallowedProject = linkedProjects.find(project =>
        project.isDeleted ||
        project.isArchived ||
        project.projectStatus === ProjectStatus.DRAFT ||
        project.projectStatus === ProjectStatus.ABORTED
    );

    if (disallowedProject) {
        return {
            success: false,
            message: "Only active, non-archived, non-deleted projects can be linked"
        };
    }

    /* ───────── Circular dependency detection ───────── */

    const circularLinkDetected = await detectCircularProjectLink({
        sourceId: sourceProjectId,
        targetIds: finalAdded
    });

    if (circularLinkDetected) {
        return {
            success: false,
            message: "Linking these projects would create a circular reference"
        };
    }

    /* ───────── Success ───────── */

    return {
        success: true,
        addedLinkedProjectIds: finalAdded,
        removedLinkedProjectIds: finalRemoved
    };

};

module.exports = {
    normalizeProjectIdList,
    validateLinkedProjectIds
}; 