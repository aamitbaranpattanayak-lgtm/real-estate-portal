const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
    },

    purpose: {
      type: String,
      enum: ["sale", "rent"],
      required: true,
    },

    propertyType: {
      type: String,
      enum: [
        "flat",
        "apartment",
        "villa",
        "bungalow",
        "house",
        "penthouse",
        "commercial",
      ],
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    bedrooms: {
      type: Number,
      default: 1,
    },

    bathrooms: {
      type: Number,
      default: 1,
    },

    area: {
      type: Number,
      required: true,
    },

    image: {
      type: String,
      required: true,
      default:
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994",
    },

    ownerName: {
      type: String,
      required: true,
    },

    ownerEmail: {
      type: String,
      required: true,
    },

    ownerPhone: {
      type: String,
      required: true,
    },

    featured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["available", "sold", "rented"],
      default: "available",
    },

    listedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Property", propertySchema);