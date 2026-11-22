const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const User = require("../models/User");
const Property = require("../models/Property");

const addFavorite = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    res.status(400);
    throw new Error("Invalid property ID");
  }

  const propertyExists = await Property.exists({ _id: propertyId });
  if (!propertyExists) {
    res.status(404);
    throw new Error("Property not found");
  }

  // Atomic update prevents duplicate favorites when requests arrive concurrently.
  const user = await User.findOneAndUpdate(
    { _id: req.user._id, favorites: { $ne: propertyId } },
    { $addToSet: { favorites: propertyId } },
    { new: true, projection: { favorites: 1 } }
  ).lean();

  if (!user) {
    res.status(400);
    throw new Error("Property already in favorites");
  }

  res.status(200).json({ success: true, message: "Added to favorites", data: user.favorites });
});

const getFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select("favorites")
    .populate("favorites")
    .lean();

  // Filter out any dangling null entries from deleted listings
  const activeFavorites = (user?.favorites || []).filter(Boolean);

  res.json({ success: true, count: activeFavorites.length, data: activeFavorites });
});

const removeFavorite = asyncHandler(async (req, res) => {
  const { propertyId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(propertyId)) {
    res.status(400);
    throw new Error("Invalid property ID");
  }

  await User.updateOne({ _id: req.user._id }, { $pull: { favorites: propertyId } });
  res.json({ success: true, message: "Removed from favorites" });
});

module.exports = { addFavorite, getFavorites, removeFavorite };
