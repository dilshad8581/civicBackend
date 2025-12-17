const express = require("express");
const {
  getProfile,
  updateProfile,
  changePassword,
} = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getProfile);
router.put("/", authMiddleware, updateProfile);
router.put("/change-password", authMiddleware, changePassword);

module.exports = router;
