const asyncHandler = require("express-async-handler");

const Property = require("../models/Property");

// Create Property
const createProperty = asyncHandler(async (req, res) => {
  const property = await Property.create({
    ...req.body,
    listedBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Property created successfully",
    data: property,
  });
});

// Get All Properties
const getProperties = asyncHandler(async (req, res) => {
  const { city, purpose, propertyType, minPrice, maxPrice } = req.query;

  const filter = {};

  if (city) filter.city = city;
  if (purpose) filter.purpose = purpose;
  if (propertyType) filter.propertyType = propertyType;

  if (minPrice || maxPrice) {
    filter.price = {};

    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const properties = await Property.find(filter).populate(
    "listedBy",
    "name email"
  );

  res.json({
    success: true,
    count: properties.length,
    data: properties,
  });
});

// Get Single Property
const getProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id).populate(
    "listedBy",
    "name email"
  );

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  res.json({
    success: true,
    data: property,
  });
});

// Update Property
const updateProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  const updated = await Property.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.json({
    success: true,
    message: "Property updated successfully",
    data: updated,
  });
});

// Delete Property
const deleteProperty = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  await property.deleteOne();

  res.json({
    success: true,
    message: "Property deleted successfully",
  });
});

// Contact Owner
const contactOwner = asyncHandler(async (req, res) => {
  const property = await Property.findById(req.params.id);

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

module.exports = {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  contactOwner,
};