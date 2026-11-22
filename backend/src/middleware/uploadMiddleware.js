const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Determine storage engine: Cloudinary if credentials provided, otherwise local disk storage
let storage;

const isCloudinaryConfigured =
  Boolean(process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "haven_properties",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      public_id: () => crypto.randomUUID(),
    },
  });
} else {
  // Ensure local uploads directory exists
  const uploadDir = path.join(__dirname, "../../uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Storage configuration with random UUID filenames to prevent path traversal and collisions
  storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${crypto.randomUUID()}${ext}`;
      cb(null, uniqueName);
    },
  });
}

// File validation filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  const ext = path.extname(file.originalname).toLowerCase();
  const mimeTypeValid = allowedMimeTypes.includes(file.mimetype);
  const extValid = allowedExtensions.includes(ext);

  if (mimeTypeValid && extValid) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, and WebP images are permitted."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1,
  },
});

module.exports = upload;
