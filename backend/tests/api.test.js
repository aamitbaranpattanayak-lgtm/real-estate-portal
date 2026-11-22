process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret-key-haven-real-estate-portal-2026";
process.env.PORT = "5001";

const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../src/app");
const generateToken = require("../src/utils/generateToken");

describe("HAVEN Real Estate Portal — API & Security Test Suite", () => {
  
  // ==========================================
  // SUITE 1: System Health & Base Routes
  // ==========================================
  describe("System Health & Root Endpoints", () => {
    it("GET /health should return 200 with status ok and uptime", async () => {
      const res = await request(app).get("/health");
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty("status", "ok");
      expect(typeof res.body.uptime).toBe("number");
    });

    it("GET / should return 200 with operational message", async () => {
      const res = await request(app).get("/");
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("HAVEN");
    });

    it("GET /api/non-existent-route should return 404 with structured JSON error", async () => {
      const res = await request(app).get("/api/non-existent-route");
      expect(res.statusCode).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Route not found");
    });
  });

  // ==========================================
  // SUITE 2: Auth Validation & Token Security
  // ==========================================
  describe("Authentication & Token Security", () => {
    it("POST /api/auth/register should reject missing fields with 400", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@example.com" });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Please fill all required fields");
    });

    it("POST /api/auth/login should reject missing password with 400", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "admin@example.com" });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Email and password are required");
    });

    it("generateToken should generate a valid signed JWT with correct algorithm", () => {
      const mockUserId = "507f1f77bcf86cd799439011";
      const token = generateToken(mockUserId);
      expect(typeof token).toBe("string");

      const decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ["HS256"] });
      expect(decoded.id).toBe(mockUserId);
    });

    it("GET /api/auth/me should reject request without Authorization header with 401", async () => {
      const res = await request(app).get("/api/auth/me");
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Not authorized. No token provided");
    });

    it("GET /api/auth/me should reject request with malformed token with 401", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid.token.payload");
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Not authorized. Invalid token");
    });
  });

  // ==========================================
  // SUITE 3: Property Validation & Query Sanitization
  // ==========================================
  describe("Property Query Bounding & Payload Validation", () => {
    it("GET /api/properties should return 400 when minPrice is not a finite number", async () => {
      const res = await request(app).get("/api/properties?minPrice=notanumber");
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("minPrice must be a valid number");
    });

    it("GET /api/properties should return 400 when maxPrice is not a finite number", async () => {
      const res = await request(app).get("/api/properties?maxPrice=xyz");
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("maxPrice must be a valid number");
    });

    it("GET /api/properties should return 400 when minPrice > maxPrice", async () => {
      const res = await request(app).get("/api/properties?minPrice=5000000&maxPrice=1000000");
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("minPrice cannot be greater than maxPrice");
    });

    it("GET /api/properties should return 400 when page or limit is less than 1", async () => {
      const res = await request(app).get("/api/properties?page=0&limit=10");
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("page and limit must be positive integers");
    });

    it("GET /api/properties/:id should return 400 for malformed MongoDB ObjectId", async () => {
      const res = await request(app).get("/api/properties/123invalidid");
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid property ID");
    });

    it("GET /api/properties/:id/contact should return 400 for malformed ObjectId", async () => {
      const res = await request(app).get("/api/properties/badid/contact");
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid property ID");
    });

    it("POST /api/properties should block unauthenticated creation with 401", async () => {
      const res = await request(app)
        .post("/api/properties")
        .send({ title: "Unauthorized Villa" });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("PUT /api/properties/:id should block unauthenticated updates with 401", async () => {
      const res = await request(app)
        .put("/api/properties/507f1f77bcf86cd799439011")
        .send({ price: 7500000 });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("DELETE /api/properties/:id should block unauthenticated deletion with 401", async () => {
      const res = await request(app).delete("/api/properties/507f1f77bcf86cd799439011");
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // SUITE 4: Inquiries & Leads Subsystem
  // ==========================================
  describe("Inquiry & Customer Lead Validation", () => {
    it("POST /api/inquiries should reject submission without propertyId with 400", async () => {
      const res = await request(app)
        .post("/api/inquiries")
        .send({
          name: "John Doe",
          email: "john@example.com",
          phone: "9876543210",
          message: "Interested in this property",
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Property ID is required");
    });

    it("POST /api/inquiries should reject invalid propertyId format with 400", async () => {
      const res = await request(app)
        .post("/api/inquiries")
        .send({
          propertyId: "not-a-valid-object-id",
          name: "John Doe",
          email: "john@example.com",
          phone: "9876543210",
          message: "Interested in this property",
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid Property ID");
    });

    it("POST /api/inquiries should reject empty required sender fields with 400", async () => {
      const res = await request(app)
        .post("/api/inquiries")
        .send({
          propertyId: "507f1f77bcf86cd799439011",
          name: "",
          email: "invalid-email",
          phone: "",
          message: "",
        });
      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("GET /api/inquiries should block unauthenticated access with 401", async () => {
      const res = await request(app).get("/api/inquiries");
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("PUT /api/inquiries/:id should block unauthenticated update with 401", async () => {
      const res = await request(app)
        .put("/api/inquiries/507f1f77bcf86cd799439011")
        .send({ status: "contacted" });
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("DELETE /api/inquiries/:id should block unauthenticated deletion with 401", async () => {
      const res = await request(app).delete("/api/inquiries/507f1f77bcf86cd799439011");
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // SUITE 5: File Upload Security
  // ==========================================
  describe("File Upload Subsystem Security", () => {
    it("POST /api/upload should block unauthenticated upload requests with 401", async () => {
      const res = await request(app)
        .post("/api/upload")
        .attach("image", Buffer.from("fake image content"), "test.jpg");
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ==========================================
  // SUITE 6: Favorites Security
  // ==========================================
  describe("Favorites Endpoints Security", () => {
    it("GET /api/favorites should block unauthenticated request with 401", async () => {
      const res = await request(app).get("/api/favorites");
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("POST /api/favorites/:propertyId should block unauthenticated request with 401", async () => {
      const res = await request(app).post("/api/favorites/507f1f77bcf86cd799439011");
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("DELETE /api/favorites/:propertyId should block unauthenticated request with 401", async () => {
      const res = await request(app).delete("/api/favorites/507f1f77bcf86cd799439011");
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
