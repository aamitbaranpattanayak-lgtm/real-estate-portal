const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { protect } = require("../middleware/authMiddleware");
const { admin } = require("../middleware/adminMiddleware");

const router = express.Router();

// @desc Upload property image
// @route POST /api/upload
// @access Private/Admin
router.post("/", protect, admin, (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      res.status(400);
      return next(new Error(err.message || "File upload failed"));
    }

    if (!req.file) {
      res.status(400);
      return next(new Error("Please attach an image file to upload"));
    }

    // Return the relative URL path served statically by Express and proxied by Vite
    const imageUrl = `/uploads/${req.file.filename}`;

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  });
});

module.exports = router;
