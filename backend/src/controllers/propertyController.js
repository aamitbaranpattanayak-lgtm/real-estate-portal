const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Property = require("../models/Property");
const User = require("../models/User");
const Inquiry = require("../models/Inquiry");

// ReDoS prevention: escape special regular expression characters safely
const escapeRegex = (string) => {
  if (typeof string !== "string") return "";
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").trim();
};

const toFiniteNumber = (value, name) => {
  if (value === undefined || value === null || value === "") return undefined;
  const number = Number(value);
  if (!Number.isFinite(number)) {
    const error = new Error(`${name} must be a valid number`);
    error.statusCode = 400;
    throw error;
  }
  return number;
};

// Validate and sanitize property body payload
const validatePropertyPayload = (body) => {
  const {
    title,
    description,
    purpose,
    propertyType,
    price,
    address,
    city,
    state,
    bedrooms,
    bathrooms,
    area,
    image,
    ownerName,
    ownerEmail,
    ownerPhone,
    featured,
    status,
    amenities,
  } = body;

  const validPurposes = ["sale", "rent"];
  const validTypes = [
    "flat",
    "apartment",
    "villa",
    "bungalow",
    "house",
    "penthouse",
    "commercial",
  ];
  const validStatuses = ["available", "sold", "rented"];

  if (!title || typeof title !== "string" || !title.trim()) {
    throw new Error("Property title is required");
  }
  if (!description || typeof description !== "string" || !description.trim()) {
    throw new Error("Description is required");
  }
  if (!purpose || !validPurposes.includes(purpose)) {
    throw new Error("Purpose must be either 'sale' or 'rent'");
  }
  if (!propertyType || !validTypes.includes(propertyType)) {
    throw new Error("Valid propertyType is required");
  }
  if (price === undefined || Number(price) < 0 || isNaN(Number(price))) {
    throw new Error("Valid non-negative price is required");
  }
  if (!address || typeof address !== "string" || !address.trim()) {
    throw new Error("Address is required");
  }
  if (!city || typeof city !== "string" || !city.trim()) {
    throw new Error("City is required");
  }
  if (!state || typeof state !== "string" || !state.trim()) {
    throw new Error("State is required");
  }
  if (area === undefined || Number(area) <= 0 || isNaN(Number(area))) {
    throw new Error("Valid positive area in square feet is required");
  }
  if (!image || typeof image !== "string" || !image.trim()) {
    throw new Error("Property image is required");
  }
  if (!ownerName || typeof ownerName !== "string" || !ownerName.trim()) {
    throw new Error("Owner name is required");
  }
  if (!ownerEmail || typeof ownerEmail !== "string" || !/^\S+@\S+\.\S+$/.test(ownerEmail.trim())) {
    throw new Error("Valid owner email is required");
  }
  if (!ownerPhone || typeof ownerPhone !== "string" || !ownerPhone.trim()) {
    throw new Error("Owner phone number is required");
  }

  const cleanPayload = {
    title: title.trim(),
    description: description.trim(),
    purpose,
    propertyType,
    price: Number(price),
    address: address.trim(),
    city: city.trim(),
    state: state.trim(),
    bedrooms: bedrooms !== undefined ? Math.max(0, Number(bedrooms)) : 1,
    bathrooms: bathrooms !== undefined ? Math.max(0, Number(bathrooms)) : 1,
    area: Number(area),
    image: image.trim(),
    ownerName: ownerName.trim(),
    ownerEmail: ownerEmail.trim().toLowerCase(),
    ownerPhone: ownerPhone.trim(),
    featured: Boolean(featured),
    status: status && validStatuses.includes(status) ? status : "available",
  };

  if (Array.isArray(amenities)) {
    cleanPayload.amenities = amenities.filter((a) => typeof a === "string" && a.trim()).map((a) => a.trim());
  }

  return cleanPayload;
};

// Create Property
const createProperty = asyncHandler(async (req, res) => {
  const validatedData = validatePropertyPayload(req.body);
  const property = await Property.create({
    ...validatedData,
    listedBy: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: "Property created successfully",
    data: property,
  });
});

// Get All Properties with filtering, keyword search, and opt-in pagination
const getProperties = asyncHandler(async (req, res) => {
  const {
    city,
    purpose,
    propertyType,
    minPrice,
    maxPrice,
    page,
    limit,
    search,
    keyword,
    status,
    featured,
  } = req.query;

  const filter = {};

  // Strict string coercion to prevent NoSQL query operator injection
  if (typeof city === "string" && city.trim()) {
    const cleanCity = city.trim();
    if (cleanCity === "Delhi-NCR") {
      filter.city = {
        $in: ["New Delhi", "Delhi", "Gurugram", "Noida", "Ghaziabad", "Faridabad"],
      };
    } else {
      filter.city = cleanCity;
    }
  }

  if (typeof purpose === "string" && purpose.trim()) {
    filter.purpose = purpose.trim();
  }

  if (typeof propertyType === "string" && propertyType.trim()) {
    filter.propertyType = propertyType.trim();
  }

  if (typeof status === "string" && status.trim()) {
    filter.status = status.trim();
  }

  if (featured === "true" || featured === true) {
    filter.featured = true;
  }

  // Price range bounding
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

  // Free-text keyword search across title, city, address, and description with ReDoS escaping
  const searchKeyword = typeof search === "string" ? search : typeof keyword === "string" ? keyword : "";
  if (searchKeyword.trim()) {
    const safePattern = escapeRegex(searchKeyword);
    filter.$or = [
      { title: { $regex: safePattern, $options: "i" } },
      { city: { $regex: safePattern, $options: "i" } },
      { address: { $regex: safePattern, $options: "i" } },
      { description: { $regex: safePattern, $options: "i" } },
    ];
  }

  const query = Property.find(filter)
    .populate("listedBy", "name email")
    .sort({ createdAt: -1 })
    .lean();

  const isPaginated = page !== undefined || limit !== undefined;

  if (isPaginated) {
    const requestedPage = toFiniteNumber(page || 1, "page");
    const requestedLimit = toFiniteNumber(limit || 20, "limit");
    if (
      !Number.isInteger(requestedPage) ||
      requestedPage < 1 ||
      !Number.isInteger(requestedLimit) ||
      requestedLimit < 1
    ) {
      res.status(400);
      throw new Error("page and limit must be positive integers");
    }
    const safeLimit = Math.min(requestedLimit, 100);
    const [properties, total] = await Promise.all([
      query.skip((requestedPage - 1) * safeLimit).limit(safeLimit),
      Property.countDocuments(filter),
    ]);
    const pagination = {
      page: requestedPage,
      limit: safeLimit,
      total,
      pages: Math.ceil(total / safeLimit),
    };
    return res.json({
      success: true,
      count: properties.length,
      data: properties,
      pagination,
    });
  }

  // Maintain existing flat array envelope for backwards compatibility with all client views
  const properties = await query;
  res.json({
    success: true,
    count: properties.length,
    data: properties,
  });
});

// Get Single Property
const getProperty = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid property ID");
  }

  const property = await Property.findById(req.params.id)
    .populate("listedBy", "name email")
    .lean();

  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  res.json({ success: true, data: property });
});

// Update Property
const updateProperty = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid property ID");
  }

  // Prevent reassignment of immutable fields
  const updatePayload = validatePropertyPayload({ ...req.body });
  delete updatePayload.listedBy;
  delete updatePayload._id;

  const updated = await Property.findByIdAndUpdate(
    req.params.id,
    { $set: updatePayload },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updated) {
    res.status(404);
    throw new Error("Property not found");
  }

  res.json({
    success: true,
    message: "Property updated successfully",
    data: updated,
  });
});

// Delete Property with Cascading Cleanup
const deleteProperty = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid property ID");
  }

  const property = await Property.findByIdAndDelete(req.params.id);
  if (!property) {
    res.status(404);
    throw new Error("Property not found");
  }

  // Prevent deleted listings from remaining in users' saved-property arrays and cascade inquiries
  await Promise.all([
    User.updateMany({ favorites: property._id }, { $pull: { favorites: property._id } }),
    Inquiry.deleteMany({ property: property._id }),
  ]);

  res.json({ success: true, message: "Property and associated records deleted successfully" });
});

// Contact Owner info (retained for backward compatibility)
const contactOwner = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    res.status(400);
    throw new Error("Invalid property ID");
  }

  const property = await Property.findById(req.params.id)
    .select("ownerName ownerEmail ownerPhone title")
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

module.exports = {
  createProperty,
  getProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  contactOwner,
};
