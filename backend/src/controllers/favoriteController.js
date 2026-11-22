const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Property = require("../models/Property");

const addFavorite = asyncHandler(async (req, res) => {
  const propertyExists = await Property.exists({ _id: req.params.propertyId });
  if (!propertyExists) {
    res.status(404);
    throw new Error("Property not found");
  }

  // Atomic update prevents duplicate favorites when requests arrive concurrently.
  const user = await User.findOneAndUpdate(
    { _id: req.user._id, favorites: { $ne: req.params.propertyId } },
    { $addToSet: { favorites: req.params.propertyId } },
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
  res.json({ success: true, count: user.favorites.length, data: user.favorites });
});

const removeFavorite = asyncHandler(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { favorites: req.params.propertyId } });
  res.json({ success: true, message: "Removed from favorites" });
});

module.exports = { addFavorite, getFavorites, removeFavorite };
