// services/comments/index.js

const { createCommentService } = require("./create-comment.service");
const { getCommentService } = require("./get-comment.service");
const { listCommentsService } = require("./list-comments.service");
const { listHierarchicalCommentsService } = require("./list-hierarchical-comments.service");
const { updateCommentService } = require("./update-comment.service");
const { deleteCommentService } = require("./delete-comment.service");

const commentServices = {
  createCommentService,
  getCommentService,
  listCommentsService,
  listHierarchicalCommentsService,
  updateCommentService,
  deleteCommentService,
};

module.exports = { commentServices };
