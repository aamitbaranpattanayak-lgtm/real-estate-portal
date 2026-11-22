const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("Not authorized. No token provided");
  }

  const token = authorization.slice(7).trim();
  if (!token || !process.env.JWT_SECRET) {
    res.status(401);
    throw new Error("Not authorized. Invalid token");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    req.user = await User.findById(decoded.id).select("-password").lean();

    if (!req.user) {
      res.status(401);
      throw new Error("User not found");
    }
  } catch (error) {
    res.status(401);
    throw new Error("Not authorized. Invalid token");
  }

  next();
});

module.exports = { protect };
