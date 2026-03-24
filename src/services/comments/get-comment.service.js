// services/comments/get-comment.service.js

const { CommentModel } = require("@models/comment.model");
const { logWithTime } = require("@utils/time-stamps.util");
const { errorMessage } = require("@utils/log-error.util");

/**
 * Fetch a single comment by ID (including replies if any)
 * 
 * @param {Object} params
 * @param {Object} params.comment - The Comment document
 * @returns {{ success: boolean, comment?: Object, replies?: Array, message?: string, error?: string }}
 */
const getCommentService = async ({ comment }) => {
  try {

    const commentObj = comment.toObject ? comment.toObject() : comment;

    // ── If this is a root comment, fetch its replies ────────────────────
    let replies = [];
    if (!comment.parentCommentId) {
      replies = await CommentModel.find({
        parentCommentId: comment._id,
        isDeleted: false,
      })
        .sort({ createdAt: 1 })
        .select("-isDeleted -deletedAt -deletedBy -deletedReason");
    }

    return {
      success: true,
      comment: commentObj,
      replies: replies.map(r => r.toObject ? r.toObject() : r),
    };

  } catch (error) {
    logWithTime(`❌ [getCommentService] Error caught while fetching comment`);
    errorMessage(error);
    return { success: false, message: "Internal error while fetching comment", error: error.message };
  }
};

module.exports = { getCommentService };
