const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
} = require("../controllers/inquiryController");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

const router = express.Router();

// Optional auth middleware: extracts user if token provided, but doesn't block guest leads
const optionalAuth = async (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization && authorization.startsWith("Bearer ")) {
    const token = authorization.slice(7).trim();
    if (token && process.env.JWT_SECRET) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
        req.user = await User.findById(decoded.id).select("-password").lean();
      } catch (err) {
        // Token invalid, proceed as guest
      }
    }
  }
  next();
};

// Public submission with optional user association
router.post("/", optionalAuth, createInquiry);

// Admin endpoints
router.get("/", protect, admin, getInquiries);
router.put("/:id", protect, admin, updateInquiryStatus);
router.delete("/:id", protect, admin, deleteInquiry);

module.exports = router;
