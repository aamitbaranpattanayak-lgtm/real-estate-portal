const asyncHandler = require("express-async-handler");

const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const toAuthResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  role: user.role,
  token: generateToken(user._id),
});

// @desc Register a new user
// @route POST /api/auth/register
// @access Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, password, phone } = req.body;
  const email = req.body.email?.trim().toLowerCase();

  if (!name || !email || !password || !phone) {
    res.status(400);
    throw new Error("Please fill all required fields");
  }

  // Uses the unique email index; this pre-check gives the existing friendly response.
  const existingUser = await User.exists({ email });
  if (existingUser) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({ name, email, password, phone });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: toAuthResponse(user),
  });
});

// @desc Login User
// @route POST /api/auth/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const email = req.body.email?.trim().toLowerCase();

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  // One indexed lookup; password is explicitly selected only for this comparison.
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: toAuthResponse(user),
  });
});

// @desc Get Current User
// @route GET /api/auth/me
// @access Private
const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

module.exports = { registerUser, loginUser, getCurrentUser };
