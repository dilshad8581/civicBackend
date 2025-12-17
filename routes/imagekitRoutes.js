const express = require("express");
const { getAuthParams } = require("../config/imagekit");

const router = express.Router();

// Get ImageKit auth parameters for client-side uploads
router.get("/auth", (req, res) => {
  try {
    const authParams = getAuthParams();
    res.json(authParams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
