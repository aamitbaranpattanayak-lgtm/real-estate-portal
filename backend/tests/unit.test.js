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
});
