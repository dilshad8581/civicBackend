const express = require("express");
const {
  createIssue,
  getAllIssues,
  getIssueById,
  getMyIssues,
  updateIssue,
  updateIssueStatus,
  deleteIssue,
  getIssueStats,
  likeIssue,
  dislikeIssue,
  addComment,
  getComments,
  deleteComment,
} = require("../controllers/issueController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Public routes
router.get("/", getAllIssues);
router.get("/stats", getIssueStats);

// Protected routes (require authentication)
router.post("/", authMiddleware, createIssue);
router.get("/my-issues", authMiddleware, getMyIssues);

// Routes with :id parameter (must come after specific routes)
router.get("/:id", getIssueById);
router.put("/:id", authMiddleware, updateIssue);
router.patch("/:id/status", authMiddleware, updateIssueStatus);
router.delete("/:id", authMiddleware, deleteIssue);

// Like/Dislike routes
router.post("/:id/like", authMiddleware, likeIssue);
router.post("/:id/dislike", authMiddleware, dislikeIssue);

// Comment routes
router.get("/:id/comments", getComments);
router.post("/:id/comments", authMiddleware, addComment);
router.delete("/:id/comments/:commentId", authMiddleware, deleteComment);

module.exports = router;
