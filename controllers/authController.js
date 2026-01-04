const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// REGISTER
exports.registerUser = async (req, res) => {
  try {
    const { name, username, email, password, phone, role } = req.body;

    // Check user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate email domain for Volunteer role
    if (role === "Volunteer") {
      const isVolunteerEmail = email.toLowerCase().endsWith("@v.com");
      if (!isVolunteerEmail) {
        return res.status(400).json({
          message: "Volunteers must register with a volunteer email (@v.com)"
        });
      }
    }

    // Validate email domain for Admin role
    if (role === "Admin") {
      const isAdminEmail = email.toLowerCase().endsWith("@a.gmail");
      if (!isAdminEmail) {
        return res.status(400).json({
          message: "Admins must register with an admin email (@a.gmail)"
        });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      username,
      email,
      phone,
      role,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User Registered Successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. User find karo
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2. Password compare karo
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. JWT token banao
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
