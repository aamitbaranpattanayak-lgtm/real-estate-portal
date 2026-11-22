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
    carpetArea,
    builtUpArea,
    superBuiltUpArea,
    image,
    images,
    floorPlan,
    floorNumber,
    totalFloors,
    furnishing,
    facing,
    balconies,
    parkingSpaces,
    reraNumber,
    reraAuthority,
    verificationStatus,
    verificationDate,
    verificationNotes,
    ownerName,
    ownerEmail,
    ownerPhone,
    featured,
    status,
    amenities,
  } = body;

  const validPurposes = ["sale", "rent", "lease"];
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
  const validFurnishing = ["unfurnished", "semi-furnished", "fully-furnished"];
  const validFacing = [
    "north",
    "south",
    "east",
    "west",
    "north-east",
    "north-west",
    "south-east",
    "south-west",
  ];
  const validVerificationStatuses = ["unverified", "self_reported", "verified", "rejected"];

  if (!title || typeof title !== "string" || !title.trim()) {
    throw new Error("Property title is required");
  }
  if (!description || typeof description !== "string" || !description.trim()) {
    throw new Error("Description is required");
  }
  if (!purpose || !validPurposes.includes(purpose)) {
    throw new Error("Purpose must be 'sale', 'rent', or 'lease'");
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
    bedrooms:
      bedrooms !== undefined
        ? Math.max(0, Number(bedrooms))
        : propertyType === "commercial"
        ? 0
        : 1,
    bathrooms: bathrooms !== undefined ? Math.max(0, Number(bathrooms)) : 1,
    area: Number(area),
    image: image.trim(),
    ownerName: ownerName.trim(),
    ownerEmail: ownerEmail.trim().toLowerCase(),
    ownerPhone: ownerPhone.trim(),
    featured: Boolean(featured),
    status: status && validStatuses.includes(status) ? status : "available",
  };

  // P2 Area Intelligence
  if (carpetArea !== undefined && carpetArea !== null && carpetArea !== "") {
    const numCarpet = Number(carpetArea);
    if (!Number.isFinite(numCarpet) || numCarpet < 0) {
      throw new Error("Carpet area must be a valid non-negative number");
    }
    cleanPayload.carpetArea = numCarpet;
  } else if (carpetArea === null || carpetArea === "") {
    cleanPayload.carpetArea = null;
  }

  if (builtUpArea !== undefined && builtUpArea !== null && builtUpArea !== "") {
    const numBuiltUp = Number(builtUpArea);
    if (!Number.isFinite(numBuiltUp) || numBuiltUp < 0) {
      throw new Error("Built-up area must be a valid non-negative number");
    }
    cleanPayload.builtUpArea = numBuiltUp;
  } else if (builtUpArea === null || builtUpArea === "") {
    cleanPayload.builtUpArea = null;
  }

  if (superBuiltUpArea !== undefined && superBuiltUpArea !== null && superBuiltUpArea !== "") {
    const numSuperBuiltUp = Number(superBuiltUpArea);
    if (!Number.isFinite(numSuperBuiltUp) || numSuperBuiltUp < 0) {
      throw new Error("Super built-up area must be a valid non-negative number");
    }
    cleanPayload.superBuiltUpArea = numSuperBuiltUp;
  } else if (superBuiltUpArea === null || superBuiltUpArea === "") {
    cleanPayload.superBuiltUpArea = null;
  }

  // Cross-field dimensional sanity: Carpet area cannot exceed built-up area or total area
  if (cleanPayload.carpetArea && cleanPayload.builtUpArea && cleanPayload.carpetArea > cleanPayload.builtUpArea) {
    throw new Error("Carpet area cannot exceed built-up area");
  }
  if (cleanPayload.carpetArea && cleanPayload.superBuiltUpArea && cleanPayload.carpetArea > cleanPayload.superBuiltUpArea) {
    throw new Error("Carpet area cannot exceed super built-up area");
  }
  if (cleanPayload.carpetArea && cleanPayload.area && cleanPayload.carpetArea > cleanPayload.area) {
    throw new Error("Carpet area cannot exceed total area");
  }

  // P2 Multi-Image Gallery & Floor Plan
  if (Array.isArray(images)) {
    cleanPayload.images = images
      .filter((img) => typeof img === "string" && img.trim())
      .map((img) => img.trim());
  } else if (typeof images === "string" && images.trim()) {
    cleanPayload.images = images
      .split(",")
      .map((img) => img.trim())
      .filter(Boolean);
  }

  if (floorPlan !== undefined && floorPlan !== null && typeof floorPlan === "string") {
    cleanPayload.floorPlan = floorPlan.trim() || null;
  }

  // P2 Architectural Specifications
  if (floorNumber !== undefined && floorNumber !== null && floorNumber !== "") {
    const fn = Number(floorNumber);
    if (!Number.isFinite(fn) || fn < -2) {
      throw new Error("Floor number cannot be below basement levels (-2)");
    }
    cleanPayload.floorNumber = fn;
  } else if (floorNumber === null || floorNumber === "") {
    cleanPayload.floorNumber = null;
  }

  if (totalFloors !== undefined && totalFloors !== null && totalFloors !== "") {
    const tf = Number(totalFloors);
    if (!Number.isFinite(tf) || tf < 0) {
      throw new Error("Total floors cannot be negative");
    }
    cleanPayload.totalFloors = tf;
  } else if (totalFloors === null || totalFloors === "") {
    cleanPayload.totalFloors = null;
  }

  if (cleanPayload.floorNumber !== undefined && cleanPayload.floorNumber !== null && cleanPayload.totalFloors !== undefined && cleanPayload.totalFloors !== null && cleanPayload.floorNumber > cleanPayload.totalFloors) {
    throw new Error("Floor number cannot exceed total floors");
  }

  if (furnishing && validFurnishing.includes(furnishing)) {
    cleanPayload.furnishing = furnishing;
  }

  if (facing && validFacing.includes(facing.toLowerCase())) {
    cleanPayload.facing = facing.toLowerCase();
  }

  if (balconies !== undefined && balconies !== null && balconies !== "") {
    const balc = Number(balconies);
    if (!Number.isFinite(balc) || balc < 0) {
      throw new Error("Balconies cannot be negative");
    }
    cleanPayload.balconies = balc;
  } else if (balconies === null || balconies === "") {
    cleanPayload.balconies = null;
  }

  if (parkingSpaces !== undefined && parkingSpaces !== null && parkingSpaces !== "") {
    const park = Number(parkingSpaces);
    if (!Number.isFinite(park) || park < 0) {
      throw new Error("Parking spaces cannot be negative");
    }
    cleanPayload.parkingSpaces = park;
  } else if (parkingSpaces === null || parkingSpaces === "") {
    cleanPayload.parkingSpaces = null;
  }

  // P2 RERA & Verification Workflow
  if (reraNumber !== undefined && reraNumber !== null && typeof reraNumber === "string") {
    cleanPayload.reraNumber = reraNumber.trim() || null;
  }

  if (reraAuthority !== undefined && reraAuthority !== null && typeof reraAuthority === "string") {
    cleanPayload.reraAuthority = reraAuthority.trim() || null;
  }

  if (verificationStatus && validVerificationStatuses.includes(verificationStatus)) {
    cleanPayload.verificationStatus = verificationStatus;
    if (verificationStatus === "verified") {
      cleanPayload.verificationDate = verificationDate ? new Date(verificationDate) : new Date();
    } else {
      cleanPayload.verificationDate = null;
    }
  }

  if (verificationNotes !== undefined && verificationNotes !== null && typeof verificationNotes === "string") {
    cleanPayload.verificationNotes = verificationNotes.trim() || null;
  }

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
    verificationStatus,
    furnishing,
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

  const rawPurpose = req.query.listingType || req.query.purpose || purpose;
  if (typeof rawPurpose === "string" && rawPurpose.trim()) {
    const cleanPurpose = rawPurpose.trim().toLowerCase();
    if (cleanPurpose === "buy") {
      filter.purpose = "sale";
    } else if (cleanPurpose === "sale" || cleanPurpose === "rent" || cleanPurpose === "lease") {
      filter.purpose = cleanPurpose;
    } else {
      filter.purpose = cleanPurpose;
    }
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

  if (typeof verificationStatus === "string" && verificationStatus.trim()) {
    filter.verificationStatus = verificationStatus.trim();
  }

  if (typeof furnishing === "string" && furnishing.trim()) {
    filter.furnishing = furnishing.trim();
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

// Candidate price range definitions per listing type
const PRICE_BRACKETS = {
  sale: [
    { key: "0-5000000", minPrice: null, maxPrice: 5000000, label: "Under ₹50 Lakh" },
    { key: "5000000-10000000", minPrice: 5000000, maxPrice: 10000000, label: "₹50 Lakh – ₹1 Crore" },
    { key: "10000000-20000000", minPrice: 10000000, maxPrice: 20000000, label: "₹1 Crore – ₹2 Crore" },
    { key: "20000000-50000000", minPrice: 20000000, maxPrice: 50000000, label: "₹2 Crore – ₹5 Crore" },
    { key: "50000000-above", minPrice: 50000000, maxPrice: null, label: "Above ₹5 Crore" },
  ],
  rent: [
    { key: "0-25000", minPrice: null, maxPrice: 25000, label: "Under ₹25,000/mo" },
    { key: "25000-50000", minPrice: 25000, maxPrice: 50000, label: "₹25,000 – ₹50,000/mo" },
    { key: "50000-100000", minPrice: 50000, maxPrice: 100000, label: "₹50,000 – ₹1,00,000/mo" },
    { key: "100000-200000", minPrice: 100000, maxPrice: 200000, label: "₹1,00,000 – ₹2,00,000/mo" },
    { key: "200000-above", minPrice: 200000, maxPrice: null, label: "Above ₹2,00,000/mo" },
  ],
  lease: [
    { key: "0-25000", minPrice: null, maxPrice: 25000, label: "Under ₹25,000/mo" },
    { key: "25000-50000", minPrice: 25000, maxPrice: 50000, label: "₹25,000 – ₹50,000/mo" },
    { key: "50000-100000", minPrice: 50000, maxPrice: 100000, label: "₹50,000 – ₹1,00,000/mo" },
    { key: "100000-200000", minPrice: 100000, maxPrice: 200000, label: "₹1,00,000 – ₹2,00,000/mo" },
    { key: "200000-above", minPrice: 200000, maxPrice: null, label: "Above ₹2,00,000/mo" },
  ],
  all: [
    { key: "0-25000", minPrice: null, maxPrice: 25000, label: "Under ₹25,000/mo" },
    { key: "25000-50000", minPrice: 25000, maxPrice: 50000, label: "₹25,000 – ₹50,000/mo" },
    { key: "50000-100000", minPrice: 50000, maxPrice: 100000, label: "₹50,000 – ₹1,00,000/mo" },
    { key: "100000-5000000", minPrice: 100000, maxPrice: 5000000, label: "₹1 Lakh – ₹50 Lakh" },
    { key: "5000000-10000000", minPrice: 5000000, maxPrice: 10000000, label: "₹50 Lakh – ₹1 Crore" },
    { key: "10000000-20000000", minPrice: 10000000, maxPrice: 20000000, label: "₹1 Crore – ₹2 Crore" },
    { key: "20000000-50000000", minPrice: 20000000, maxPrice: 50000000, label: "₹2 Crore – ₹5 Crore" },
    { key: "50000000-above", minPrice: 50000000, maxPrice: null, label: "Above ₹5 Crore" },
  ],
};

// GET /api/properties/filter-options
// Dynamically extracts available cities, price ranges, and property types from real DB records
const getFilterOptions = asyncHandler(async (req, res) => {
  const matchFilter = {};
  let purposeKey = "all";

  const rawListingType = req.query.listingType || req.query.purpose;
  if (typeof rawListingType === "string" && rawListingType.trim()) {
    const norm = rawListingType.trim().toLowerCase();
    if (norm === "buy" || norm === "sale") {
      matchFilter.purpose = "sale";
      purposeKey = "sale";
    } else if (norm === "rent") {
      matchFilter.purpose = "rent";
      purposeKey = "rent";
    } else if (norm === "lease") {
      matchFilter.purpose = "lease";
      purposeKey = "lease";
    }
  }

  if (typeof req.query.status === "string" && req.query.status.trim()) {
    matchFilter.status = req.query.status.trim();
  }

  const [aggregateResult] = await Property.aggregate([
    { $match: matchFilter },
    {
      $facet: {
        total: [{ $count: "count" }],
        cities: [
          {
            $match: {
              city: { $exists: true, $type: "string", $ne: "" },
            },
          },
          {
            $project: {
              trimmedCity: { $trim: { input: "$city" } },
            },
          },
          {
            $group: {
              _id: "$trimmedCity",
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
        prices: [
          {
            $match: {
              price: { $exists: true, $type: "number", $gte: 0 },
            },
          },
          {
            $project: {
              price: 1,
            },
          },
        ],
        propertyTypes: [
          {
            $match: {
              propertyType: { $exists: true, $type: "string", $ne: "" },
            },
          },
          {
            $group: {
              _id: "$propertyType",
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  const totalProperties = aggregateResult?.total?.[0]?.count || 0;
  const cities = (aggregateResult?.cities || []).map((c) => ({
    name: c._id,
    count: c.count,
  }));
  const propertyTypes = (aggregateResult?.propertyTypes || []).map((t) => ({
    name: t._id,
    count: t.count,
  }));

  const rawPrices = (aggregateResult?.prices || [])
    .map((p) => p.price)
    .filter((p) => typeof p === "number" && !isNaN(p) && p >= 0);

  const brackets = PRICE_BRACKETS[purposeKey] || PRICE_BRACKETS.all;
  const priceRanges = [];

  for (const bracket of brackets) {
    const count = rawPrices.filter((p) => {
      if (bracket.minPrice !== null && bracket.maxPrice !== null) {
        return p >= bracket.minPrice && p <= bracket.maxPrice;
      }
      if (bracket.minPrice === null && bracket.maxPrice !== null) {
        return p <= bracket.maxPrice;
      }
      if (bracket.minPrice !== null && bracket.maxPrice === null) {
        return p >= bracket.minPrice;
      }
      return true;
    }).length;

    // Strict requirement: Only show price ranges containing at least one matching property
    if (count > 0) {
      priceRanges.push({
        key: bracket.key,
        minPrice: bracket.minPrice,
        maxPrice: bracket.maxPrice,
        label: bracket.label,
        count,
      });
    }
  }

  const priceStats =
    rawPrices.length > 0
      ? {
          min: Math.min(...rawPrices),
          max: Math.max(...rawPrices),
          avg: Math.round(rawPrices.reduce((a, b) => a + b, 0) / rawPrices.length),
        }
      : null;

  res.status(200).json({
    success: true,
    data: {
      listingType: purposeKey,
      totalProperties,
      cities,
      priceRanges,
      propertyTypes,
      priceStats,
    },
  });
});

module.exports = {
  createProperty,
  getProperties,
  getProperty,
  getFilterOptions,
  updateProperty,
  deleteProperty,
  contactOwner,
};
