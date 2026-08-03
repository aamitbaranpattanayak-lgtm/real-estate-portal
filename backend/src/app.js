const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/authRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/properties", propertyRoutes);
// Health Check Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Real Estate Portal API is running 🚀",
  });
});
app.use("/api/favorites", favoriteRoutes);

module.exports = app;