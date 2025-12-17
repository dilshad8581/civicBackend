const User = require("../models/userModel");
const bcrypt = require("bcrypt");

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const { name, username, phone, location, bio } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { name, username, phone, location, bio },
      { new: true }
    ).select("-password");

    res.json({ message: "Profile updated", user: updatedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE PROFILE IMAGE (accepts ImageKit URL from client-side upload)
exports.updateProfileImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "No image URL provided" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { imageUrl },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile image updated successfully",
      imageUrl,
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CHANGE PASSWORD
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.userId);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is wrong" });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
