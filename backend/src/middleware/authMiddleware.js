const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check Authorization Header
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      // Verify JWT
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get User
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        throw new Error("User not found");
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized. Invalid token");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized. No token provided");
  }
});

module.exports = {
  protect,
};