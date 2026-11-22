const mongoose = require("mongoose");

const propertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
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
      required: [true, "Property purpose (sale or rent) is required"],
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
      required: [true, "Property type is required"],
    },

    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
      maxlength: [300, "Address cannot exceed 300 characters"],
    },

    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
      maxlength: [100, "City cannot exceed 100 characters"],
    },

    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
      maxlength: [100, "State cannot exceed 100 characters"],
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
      required: [true, "Area in square feet is required"],
      min: [0, "Area cannot be negative"],
    },

    // P2 Area Intelligence (sq.ft)
    carpetArea: {
      type: Number,
      min: [0, "Carpet area cannot be negative"],
      default: null,
    },

    builtUpArea: {
      type: Number,
      min: [0, "Built-up area cannot be negative"],
      default: null,
    },

    superBuiltUpArea: {
      type: Number,
      min: [0, "Super built-up area cannot be negative"],
      default: null,
    },

    image: {
      type: String,
      required: [true, "Property image URL is required"],
      default:
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&auto=format&fit=crop",
    },

    // P2 Multi-Image Gallery & Architectural Floor Plans
    images: {
      type: [String],
      default: [],
    },

    floorPlan: {
      type: String,
      default: null,
    },

    // P2 Architectural Specifications
    floorNumber: {
      type: Number,
      min: [-2, "Floor number cannot be below basement levels (-2)"],
      default: null,
    },

    totalFloors: {
      type: Number,
      min: [0, "Total floors cannot be negative"],
      default: null,
    },

    furnishing: {
      type: String,
      enum: ["unfurnished", "semi-furnished", "fully-furnished"],
      default: undefined,
    },

    facing: {
      type: String,
      enum: [
        "north",
        "south",
        "east",
        "west",
        "north-east",
        "north-west",
        "south-east",
        "south-west",
      ],
      default: undefined,
    },

    balconies: {
      type: Number,
      min: [0, "Balconies cannot be negative"],
      default: null,
    },

    parkingSpaces: {
      type: Number,
      min: [0, "Parking spaces cannot be negative"],
      default: null,
    },

    // P2 RERA & Verification Workflow
    reraNumber: {
      type: String,
      trim: true,
      maxlength: [100, "RERA number cannot exceed 100 characters"],
      default: null,
    },

    reraAuthority: {
      type: String,
      trim: true,
      maxlength: [100, "RERA authority cannot exceed 100 characters"],
      default: null,
    },

    verificationStatus: {
      type: String,
      enum: ["unverified", "self_reported", "verified", "rejected"],
      default: "unverified",
    },

    verificationDate: {
      type: Date,
      default: null,
    },

    verificationNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Verification notes cannot exceed 1000 characters"],
      default: null,
    },

    ownerName: {
      type: String,
      required: [true, "Owner name is required"],
      trim: true,
      maxlength: [100, "Owner name cannot exceed 100 characters"],
    },

    ownerEmail: {
      type: String,
      required: [true, "Owner email is required"],
      trim: true,
      lowercase: true,
      maxlength: [254, "Owner email cannot exceed 254 characters"],
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid owner email"],
    },

    ownerPhone: {
      type: String,
      required: [true, "Owner phone is required"],
      trim: true,
      maxlength: [30, "Owner phone cannot exceed 30 characters"],
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

    amenities: {
      type: [String],
      default: [
        "24/7 Security Guards",
        "100% Power Backup",
        "Covered Car Parking",
        "Modular Fitted Kitchen",
        "High-Speed Elevators",
        "Clubhouse & Gym",
        "Swimming Pool Access",
        "Vastu Compliant",
      ],
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

// Compound indexes for high-speed multi-parameter public listing queries
propertySchema.index({ city: 1, purpose: 1, propertyType: 1, price: 1 });
propertySchema.index({ featured: 1, createdAt: -1 });
propertySchema.index({ listedBy: 1, createdAt: -1 });
propertySchema.index({ status: 1, createdAt: -1 });

// Full-text search index on search targets
propertySchema.index(
  { title: "text", address: "text", city: "text", description: "text" },
  { weights: { title: 10, city: 5, address: 5, description: 1 } }
);

module.exports = mongoose.model("Property", propertySchema);
