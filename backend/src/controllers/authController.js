const asyncHandler = require("express-async-handler");

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

// @desc Register a new user
// @route POST /api/auth/register
// @access Public

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;

  // Validate input
  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    phone,
  });

  // Send response
  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});


// @desc Login User
// @route POST /api/auth/login
// @access Public

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate request
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  // Find user and include password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Compare password
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Success Response
  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    },
  });
});
// @desc Get Current User
// @route GET /api/auth/me
// @access Private

const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user,
  });
});
module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
};