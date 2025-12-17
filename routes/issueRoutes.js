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

module.exports = router;
