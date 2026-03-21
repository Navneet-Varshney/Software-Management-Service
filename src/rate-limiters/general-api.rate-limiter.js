// middlewares/rate-limiters/apiRateLimiters.js
const { createRateLimiter } = require("./create.rate-limiter");
const { perUserAndDevice } = require("@configs/rate-limit.config");


const welcomeAdminRateLimiter = createRateLimiter(perUserAndDevice.welcomeAdmin);
const welcomeClientRateLimiter = createRateLimiter(perUserAndDevice.welcomeClient);

const createProjectRateLimiter   = createRateLimiter(perUserAndDevice.createProject);
const updateProjectRateLimiter   = createRateLimiter(perUserAndDevice.updateProject);
const onHoldProjectRateLimiter   = createRateLimiter(perUserAndDevice.onHoldProject);
const abortProjectRateLimiter    = createRateLimiter(perUserAndDevice.abortProject);
const completeProjectRateLimiter = createRateLimiter(perUserAndDevice.completeProject);
const resumeProjectRateLimiter   = createRateLimiter(perUserAndDevice.resumeProject);
const deleteProjectRateLimiter   = createRateLimiter(perUserAndDevice.deleteProject);
const archiveProjectRateLimiter  = createRateLimiter(perUserAndDevice.archiveProject);
const getProjectRateLimiter      = createRateLimiter(perUserAndDevice.getProject);
const getProjectsRateLimiter     = createRateLimiter(perUserAndDevice.getProjects);

const createStakeholderRateLimiter = createRateLimiter(perUserAndDevice.createStakeholder);
const updateStakeholderRateLimiter = createRateLimiter(perUserAndDevice.updateStakeholder);
const deleteStakeholderRateLimiter = createRateLimiter(perUserAndDevice.deleteStakeholder);
const getStakeholderRateLimiter    = createRateLimiter(perUserAndDevice.getStakeholder);
const getStakeholdersRateLimiter   = createRateLimiter(perUserAndDevice.getStakeholders);

const clientGetProjectRateLimiter      = createRateLimiter(perUserAndDevice.clientGetProject);
const clientListProjectsRateLimiter    = createRateLimiter(perUserAndDevice.clientListProjects);
const clientGetStakeholderRateLimiter  = createRateLimiter(perUserAndDevice.clientGetStakeholder);
const clientListStakeholdersRateLimiter = createRateLimiter(perUserAndDevice.clientListStakeholders);

const createProductRequestRateLimiter = createRateLimiter(perUserAndDevice.createProductRequest);
const updateProductRequestRateLimiter = createRateLimiter(perUserAndDevice.updateProductRequest);
const deleteProductRequestRateLimiter = createRateLimiter(perUserAndDevice.deleteProductRequest);
const getProductRequestRateLimiter    = createRateLimiter(perUserAndDevice.getProductRequest);
const listProductRequestsRateLimiter   = createRateLimiter(perUserAndDevice.listProductRequests);
const cancelProductRequestRateLimiter = createRateLimiter(perUserAndDevice.cancelProductRequest);
const approveProductRequestRateLimiter = createRateLimiter(perUserAndDevice.approveProductRequest);
const rejectProductRequestRateLimiter = createRateLimiter(perUserAndDevice.rejectProductRequest);

module.exports = {
    welcomeAdminRateLimiter,
    welcomeClientRateLimiter,
    createProjectRateLimiter,
    updateProjectRateLimiter,
    onHoldProjectRateLimiter,
    abortProjectRateLimiter,
    completeProjectRateLimiter,
    resumeProjectRateLimiter,
    deleteProjectRateLimiter,
    archiveProjectRateLimiter,
    getProjectRateLimiter,
    getProjectsRateLimiter,
    createStakeholderRateLimiter,
    updateStakeholderRateLimiter,
    deleteStakeholderRateLimiter,
    getStakeholderRateLimiter,
    getStakeholdersRateLimiter,
    clientGetProjectRateLimiter,
    clientListProjectsRateLimiter,
    clientGetStakeholderRateLimiter,
    clientListStakeholdersRateLimiter,
    createProductRequestRateLimiter,
    updateProductRequestRateLimiter,
    deleteProductRequestRateLimiter,
    getProductRequestRateLimiter,
    listProductRequestsRateLimiter,
    cancelProductRequestRateLimiter,
    approveProductRequestRateLimiter,
    rejectProductRequestRateLimiter
}