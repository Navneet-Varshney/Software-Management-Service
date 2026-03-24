// services/comments/list-hierarchical-comments.service.js

const { CommentModel } = require("@models/comment.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");

const listHierarchicalCommentsService = async ({
  entityType,
  entityId,
  page = 1,
  limit = 10,
}) => {
  try {
    const skip = (page - 1) * limit;

    // ── Step 1: Fetch ALL comments for entity ───────────────────────────
    const allComments = await CommentModel.find({
      entityType,
      entityId,
      isDeleted: false,
    })
      .sort({ createdAt: 1 }) // oldest first (better for tree build)
      .select("-isDeleted -deletedAt -deletedBy -deletedReason")
      .lean();

    // ── Step 2: Build map ──────────────────────────────────────────────
    const commentMap = {};
    allComments.forEach((c) => {
      commentMap[c._id] = { ...c, replies: [] };
    });

    // ── Step 3: Build tree ─────────────────────────────────────────────
    const rootComments = [];

    allComments.forEach((c) => {
      if (c.parentCommentId) {
        const parent = commentMap[c.parentCommentId];
        if (parent) {
          parent.replies.push(commentMap[c._id]);
        }
      } else {
        rootComments.push(commentMap[c._id]);
      }
    });

    // ── Step 4: Pagination on root comments ────────────────────────────
    const totalRootComments = rootComments.length;
    const paginatedRoots = rootComments
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // newest root first
      .slice(skip, skip + limit);

    const pages = Math.ceil(totalRootComments / limit);

    return {
      success: true,
      comments: paginatedRoots,
      total: totalRootComments,
      page,
      pages,
    };

  } catch (error) {
    logWithTime(`❌ [listHierarchicalCommentsService] Error caught`);
    errorMessage(error);
    return {
      success: false,
      message: "Internal error while fetching comments",
      error: error.message,
    };
  }
};

module.exports = { listHierarchicalCommentsService };