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
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
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
      min: [0, "Price cannot be negative"],
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    bedrooms: {
      type: Number,
      default: 1,
      min: [0, "Bedrooms cannot be negative"],
    },

    bathrooms: {
      type: Number,
      default: 1,
      min: [0, "Bathrooms cannot be negative"],
    },

    area: {
      type: Number,
      required: true,
      min: [0, "Area cannot be negative"],
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

// Matches public listing filters, including a price range.
propertySchema.index({ city: 1, purpose: 1, propertyType: 1, price: 1 });
propertySchema.index({ featured: 1, createdAt: -1 });
propertySchema.index({ listedBy: 1, createdAt: -1 });

module.exports = mongoose.model("Property", propertySchema);
