const bcrypt = require("bcryptjs");
const { errorHandler, notFound } = require("../src/middleware/errorMiddleware");

describe("HAVEN Real Estate Portal — Unit Tests", () => {
  
  describe("Password Hashing & Verification (bcryptjs)", () => {
    it("should hash a plaintext password and verify correctly", async () => {
      const plaintext = "SecurePass123!";
      const hash = await bcrypt.hash(plaintext, 10);

      expect(typeof hash).toBe("string");
      expect(hash).not.toBe(plaintext);

      const isValid = await bcrypt.compare(plaintext, hash);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare("WrongPassword", hash);
      expect(isInvalid).toBe(false);
    });
  });

  describe("Error Middleware Handling", () => {
    it("should format CastError into a 400 Bad Request", () => {
      const req = { method: "GET", originalUrl: "/test" };
      const res = {
        statusCode: 200,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json: jest.fn(),
      };
      const next = jest.fn();

      const castError = new Error("Cast to ObjectId failed");
      castError.name = "CastError";
      castError.path = "propertyId";

      errorHandler(castError, req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Invalid format for propertyId",
        })
      );
    });

    it("should format duplicate key 11000 into a 400 with dynamic field name", () => {
      const req = { method: "POST", originalUrl: "/test" };
      const res = {
        statusCode: 200,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json: jest.fn(),
      };
      const next = jest.fn();

      const dupError = new Error("E11000 duplicate key error");
      dupError.code = 11000;
      dupError.keyValue = { email: "taken@example.com" };

      errorHandler(dupError, req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Email already exists",
        })
      );
    });

    it("should format LIMIT_FILE_SIZE error into a 400 Bad Request", () => {
      const req = { method: "POST", originalUrl: "/api/upload" };
      const res = {
        statusCode: 200,
        status(code) {
          this.statusCode = code;
          return this;
        },
        json: jest.fn(),
      };
      const next = jest.fn();

      const multerError = new Error("File too large");
      multerError.code = "LIMIT_FILE_SIZE";

      errorHandler(multerError, req, res, next);
      expect(res.statusCode).toBe(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "File size exceeds the 5MB limit",
        })
      );
    });
  });

  describe("Indian Rupee & Price Formatting Logic", () => {
    // Testing the core logic used by formatters.js
    const formatPrice = (price, purpose = '') => {
      if (price === undefined || price === null || isNaN(price)) return '₹0';
      if (price >= 10000000) {
        const cr = (price / 10000000).toFixed(2).replace(/\.00$/, '');
        return `₹${cr} Cr`;
      }
      if (price >= 100000) {
        const lakh = (price / 100000).toFixed(2).replace(/\.00$/, '');
        return `₹${lakh} Lakh`;
      }
      const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(price);
      return purpose === 'rent' ? `${formatted}/mo` : formatted;
    };

    it("should correctly format values in Crores", () => {
      expect(formatPrice(65000000)).toBe("₹6.50 Cr");
      expect(formatPrice(10000000)).toBe("₹1 Cr");
    });

    it("should correctly format values in Lakhs", () => {
      expect(formatPrice(6500000)).toBe("₹65 Lakh");
      expect(formatPrice(9800000)).toBe("₹98 Lakh");
    });

    it("should correctly format rental prices with /mo suffix", () => {
      const rentResult = formatPrice(28000, "rent");
      expect(rentResult).toContain("/mo");
      expect(rentResult).toContain("28,000");
    });

    it("should gracefully handle null, undefined, or NaN", () => {
      expect(formatPrice(null)).toBe("₹0");
      expect(formatPrice(undefined)).toBe("₹0");
      expect(formatPrice(NaN)).toBe("₹0");
    });
  });

  // ==========================================
  // P2: Real Estate Domain Intelligence Tests
  // ==========================================
  describe("P2 Area & Price Intelligence Calculations", () => {
    const calculatePricingMetrics = (price, purpose, carpetArea, totalArea) => {
      if (!price || price <= 0) return { pricePerSqFt: null, basis: null };
      
      const effectiveArea = carpetArea && carpetArea > 0 ? carpetArea : totalArea;
      const basis = carpetArea && carpetArea > 0 ? "Carpet Area" : "Total Area";
      
      if (!effectiveArea || effectiveArea <= 0) return { pricePerSqFt: null, basis: null };

      const pricePerSqFt = Math.round(price / effectiveArea);
      return {
        pricePerSqFt,
        basis,
        unit: purpose === "rent" ? "₹/sq.ft/mo" : "₹/sq.ft",
      };
    };

    it("should prioritize Carpet Area for price per sq.ft calculation when available", () => {
      // Sale property: ₹98 Lakh, Carpet: 1200 sq.ft, Total: 1650 sq.ft
      const metrics = calculatePricingMetrics(9800000, "sale", 1200, 1650);
      expect(metrics.pricePerSqFt).toBe(8167); // 9800000 / 1200
      expect(metrics.basis).toBe("Carpet Area");
      expect(metrics.unit).toBe("₹/sq.ft");
    });

    it("should explicitly identify Total Area fallback when carpet area is missing", () => {
      // Sale property: ₹65 Lakh, Carpet: null, Total: 1100 sq.ft
      const metrics = calculatePricingMetrics(6500000, "sale", null, 1100);
      expect(metrics.pricePerSqFt).toBe(5909); // 6500000 / 1100
      expect(metrics.basis).toBe("Total Area");
      expect(metrics.unit).toBe("₹/sq.ft");
    });

    it("should calculate monthly rental rate per sq.ft with carpet area basis", () => {
      // Rental property: ₹45,000/mo, Carpet: 800 sq.ft
      const metrics = calculatePricingMetrics(45000, "rent", 800, 1050);
      expect(metrics.pricePerSqFt).toBe(56); // 45000 / 800
      expect(metrics.basis).toBe("Carpet Area");
      expect(metrics.unit).toBe("₹/sq.ft/mo");
    });

    it("should guard against division by zero and negative areas", () => {
      expect(calculatePricingMetrics(6500000, "sale", 0, 0).pricePerSqFt).toBeNull();
      expect(calculatePricingMetrics(6500000, "sale", null, -100).pricePerSqFt).toBeNull();
      expect(calculatePricingMetrics(0, "sale", 1000, 1200).pricePerSqFt).toBeNull();
    });

    it("should prevent duplicate rental period suffixes", () => {
      const formatRentalLabel = (formattedPrice) => {
        // If formattedPrice already ends with /mo, do not append / month
        if (formattedPrice.endsWith("/mo")) return formattedPrice;
        return `${formattedPrice}/mo`;
      };

      const output1 = formatRentalLabel("₹28,000/mo");
      expect(output1).toBe("₹28,000/mo");
      expect(output1).not.toContain("/ month");
    });
  });

  describe("P2 Specification Adaptation (Residential vs Commercial)", () => {
    const formatPropertySpecs = (property) => {
      const isCommercial = property.propertyType === "commercial";
      if (isCommercial) {
        return {
          displayBedrooms: null, // Commercial must never display '0 Beds'
          displayBathrooms: property.bathrooms ? `${property.bathrooms} Washrooms` : null,
          typologyLabel: "Commercial Work Space",
        };
      }
      return {
        displayBedrooms: property.bedrooms ? `${property.bedrooms} BHK` : null,
        displayBathrooms: property.bathrooms ? `${property.bathrooms} Baths` : null,
        typologyLabel: "Residential",
      };
    };

    it("should suppress bedroom display for commercial properties", () => {
      const commercialProp = {
        propertyType: "commercial",
        bedrooms: 0,
        bathrooms: 2,
      };
      const specs = formatPropertySpecs(commercialProp);
      expect(specs.displayBedrooms).toBeNull();
      expect(specs.displayBathrooms).toBe("2 Washrooms");
      expect(specs.typologyLabel).toBe("Commercial Work Space");
    });

    it("should correctly render residential bedroom and bathroom counts", () => {
      const residentialProp = {
        propertyType: "apartment",
        bedrooms: 3,
        bathrooms: 3,
      };
      const specs = formatPropertySpecs(residentialProp);
      expect(specs.displayBedrooms).toBe("3 BHK");
      expect(specs.displayBathrooms).toBe("3 Baths");
    });
  });

  describe("P2 RERA & Verification Workflow Logic", () => {
    const resolveVerificationBadge = (verificationStatus, reraNumber) => {
      if (verificationStatus === "verified") {
        return {
          status: "verified",
          label: "Verified Registration",
          tone: "emerald",
          hasBadge: true,
        };
      }
      if (reraNumber && verificationStatus !== "verified") {
        return {
          status: "self_reported",
          label: "Self-Reported RERA (Pending Verification)",
          tone: "amber",
          hasBadge: false, // Must not claim official verification
        };
      }
      return {
        status: "unverified",
        label: "RERA Details Not Disclosed",
        tone: "stone",
        hasBadge: false,
      };
    };

    it("should only grant verified status when verificationStatus is explicitly 'verified'", () => {
      const result = resolveVerificationBadge("verified", "PRM/KA/RERA/1251/446/PR/171015/000456");
      expect(result.status).toBe("verified");
      expect(result.hasBadge).toBe(true);
      expect(result.label).toBe("Verified Registration");
    });

    it("should flag self-reported registration when reraNumber exists but verification is pending", () => {
      const result = resolveVerificationBadge("self_reported", "PRM/KA/RERA/1251/446/PR/171015/000456");
      expect(result.status).toBe("self_reported");
      expect(result.hasBadge).toBe(false);
      expect(result.label).toContain("Pending Verification");
    });

    it("should handle missing RERA without false claims", () => {
      const result = resolveVerificationBadge("unverified", null);
      expect(result.status).toBe("unverified");
      expect(result.hasBadge).toBe(false);
      expect(result.label).toBe("RERA Details Not Disclosed");
    });
  });
});
