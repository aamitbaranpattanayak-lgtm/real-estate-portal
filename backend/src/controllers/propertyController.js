const asyncHandler = require("express-async-handler");
const Property = require("../models/Property");
const User = require("../models/User");

const toFiniteNumber = (value, name) => {
  if (value === undefined) return undefined;
  const number = Number(value);
  if (!Number.isFinite(number)) {
    const error = new Error(`${name} must be a valid number`);
    error.statusCode = 400;
    throw error;
  }
  return number;
};

// Create Property
const createProperty = asyncHandler(async (req, res) => {
  const property = await Property.create({ ...req.body, listedBy: req.user._id });
  res.status(201).json({ success: true, message: "Property created successfully", data: property });
});

// Get All Properties. Pagination is opt-in to preserve the existing unpaginated response.
const getProperties = asyncHandler(async (req, res) => {
  const { city, purpose, propertyType, minPrice, maxPrice, page, limit } = req.query;
  const filter = {};
  if (city) filter.city = city;
  if (purpose) filter.purpose = purpose;
  if (propertyType) filter.propertyType = propertyType;

  const minimumPrice = toFiniteNumber(minPrice, "minPrice");
  const maximumPrice = toFiniteNumber(maxPrice, "maxPrice");
  if (minimumPrice !== undefined || maximumPrice !== undefined) {
    filter.price = {};
    if (minimumPrice !== undefined) filter.price.$gte = minimumPrice;
    if (maximumPrice !== undefined) filter.price.$lte = maximumPrice;
  }

  if (minimumPrice !== undefined && maximumPrice !== undefined && minimumPrice > maximumPrice) {
    res.status(400);
    throw new Error("minPrice cannot be greater than maxPrice");
  }

  const query = Property.find(filter)
    .populate("listedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();
  const isPaginated = page !== undefined || limit !== undefined;
  let pagination;

  if (isPaginated) {
    const requestedPage = toFiniteNumber(page || 1, "page");
    const requestedLimit = toFiniteNumber(limit || 20, "limit");
    if (!Number.isInteger(requestedPage) || requestedPage < 1 || !Number.isInteger(requestedLimit) || requestedLimit < 1) {
      res.status(400);
      throw new Error("page and limit must be positive integers");
    }
    const safeLimit = Math.min(requestedLimit, 100);
    const [properties, total] = await Promise.all([
      query.skip((requestedPage - 1) * safeLimit).limit(safeLimit),
      Property.countDocuments(filter),
    ]);
    pagination = { page: requestedPage, limit: safeLimit, total, pages: Math.ceil(total / safeLimit) };
    return res.json({ success: true, count: properties.length, data: properties, pagination });
  }

  const properties = await query;
  res.json({ success: true, count: properties.length, data: properties });
});

const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate("listedBy", "name email").lean();
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  res.json({ success: true, data: property });
});

const updateProperty = asyncHandler(async (req, res) => {
  // The owner of a listing cannot be reassigned through this public API payload.
  const update = { ...req.body };
  delete update.listedBy;
  delete update._id;

  const updated = await Property.findByIdAndUpdate(req.params.id, { $set: update }, {
    new: true,
    runValidators: true,
  });
  if (!updated) {
    res.status(404);
    throw new Error("Property not found");
  }
  res.json({ success: true, message: "Property updated successfully", data: updated });
});

const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findByIdAndDelete(req.params.id);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  // Prevent deleted listings from remaining in users' saved-property arrays.
  await User.updateMany({ favorites: property._id }, { $pull: { favorites: property._id } });
  res.json({ success: true, message: "Property deleted successfully" });
});

const contactOwner = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id)
    .select("ownerName ownerEmail ownerPhone")
    .lean();
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }
  res.status(200).json({
    success: true,
    data: {
      ownerName: property.ownerName,
      ownerEmail: property.ownerEmail,
      ownerPhone: property.ownerPhone,
    },
  });
});

module.exports = { createProperty, getProperties, getProperty, updateProperty, deleteProperty, contactOwner };
