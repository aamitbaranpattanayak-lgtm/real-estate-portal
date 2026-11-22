const express = require("express");

const {
  createProperty,
  getProperties,
  getProperty,
  getFilterOptions,
  updateProperty,
  deleteProperty,
  contactOwner,
} = require("../controllers/propertyController");

const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

const router = express.Router();

// Public Routes
router.get("/filter-options", getFilterOptions);
router.get("/", getProperties);

router.get("/:id/contact", contactOwner);

router.get("/:id", getProperty);

// Admin Routes
router.post("/", protect, admin, createProperty);

router.put("/:id", protect, admin, updateProperty);

router.delete("/:id", protect, admin, deleteProperty);

module.exports = router;