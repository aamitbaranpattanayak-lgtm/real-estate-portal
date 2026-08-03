const asyncHandler = require("express-async-handler");

const User = require("../models/User");
const Property = require("../models/Property");

// Add Favorite
const addFavorite = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.propertyId);

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  if (req.user.favorites.includes(property._id)) {
    res.status(400);
    throw new Error("Property already in favorites");
  }

  req.user.favorites.push(property._id);

  await req.user.save();

  res.status(200).json({
    success: true,
    message: "Added to favorites",
    data: req.user.favorites,
  });
});

// Get Favorites
const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("favorites");

  res.json({
    success: true,
    count: user.favorites.length,
    data: user.favorites,
  });
});

// Remove Favorite
const removeFavorite = asyncHandler(async (req, res) => {
  req.user.favorites = req.user.favorites.filter(
    (id) => id.toString() !== req.params.propertyId
  );

  await req.user.save();

  res.json({
    success: true,
    message: "Removed from favorites",
  });
});

module.exports = {
  addFavorite,
  getFavorites,
  removeFavorite,
};