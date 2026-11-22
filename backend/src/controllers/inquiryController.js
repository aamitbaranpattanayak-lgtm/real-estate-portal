const asyncHandler = require("express-async-handler");
const mongoose = require("mongoose");
const Inquiry = require("../models/Inquiry");
const Property = require("../models/Property");

// Helper to sanitize free text by removing raw HTML tags (Stored XSS prevention)
const sanitizeText = (text) => {
  if (typeof text !== "string") return "";
  return text.replace(/[<>]/g, "").trim();
};

// @desc Submit an inquiry for a property
// @route POST /api/inquiries
// @access Public (guests or logged-in users)
const createInquiry = asyncHandler(async (req, res) => {
  const { propertyId, property: propIdBody, name, email, phone, message } = req.body;
  const targetPropertyId = propertyId || propIdBody;

  if (!targetPropertyId) {
    res.status(400);
    throw new Error("Property ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(targetPropertyId)) {
    res.status(400);
    throw new Error("Invalid Property ID");
  }

  const cleanName = sanitizeText(name);
  const cleanEmail = (email || "").trim().toLowerCase();
  const cleanPhone = sanitizeText(phone);
  const cleanMessage = sanitizeText(message);

  if (!cleanName || !cleanEmail || !cleanPhone || !cleanMessage) {
    res.status(400);
    throw new Error("Please fill all required fields: name, email, phone, and message");
  }

  const propertyExists = await Property.findById(targetPropertyId).select("_id title").lean();
  if (!propertyExists) {
    res.status(404);
    throw new Error("Property not found");
  }

  const inquiry = await Inquiry.create({
    property: targetPropertyId,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    message: cleanMessage,
    user: req.user ? req.user._id : null,
  });

  res.status(201).json({
    success: true,
    message: "Inquiry submitted successfully! The owner will get in touch soon.",
    data: inquiry,
  });
});

// @desc Get all inquiries (with property details)
// @route GET /api/inquiries
// @access Private/Admin
const getInquiries = asyncHandler(async (req, res) => {
  const inquiries = await Inquiry.find()
    .populate({
      path: "property",
      select: "title city price propertyType purpose image address ownerName ownerPhone ownerEmail",
    })
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: inquiries.length,
    data: inquiries,
  });
});

// @desc Update inquiry status
// @route PUT /api/inquiries/:id
// @access Private/Admin
const updateInquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["pending", "contacted", "resolved"];

  if (!status || !validStatuses.includes(status)) {
    res.status(400);
    throw new Error("Invalid status. Must be pending, contacted, or resolved");
  }

  const inquiry = await Inquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!inquiry) {
    res.status(404);
    throw new Error("Inquiry not found");
  }

  res.status(200).json({
    success: true,
    message: "Inquiry status updated",
    data: inquiry,
  });
});

// @desc Delete an inquiry
// @route DELETE /api/inquiries/:id
// @access Private/Admin
const deleteInquiry = asyncHandler(async (req, res) => {
  const inquiry = await Inquiry.findByIdAndDelete(req.params.id);

  if (!inquiry) {
    res.status(404);
    throw new Error("Inquiry not found");
  }

  res.status(200).json({
    success: true,
    message: "Inquiry deleted successfully",
  });
});

module.exports = {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
};
