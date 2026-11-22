const Property = require("../src/models/Property");
const { getFilterOptions } = require("../src/controllers/propertyController");

describe("Filter Options API & Aggregation Unit Tests", () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    mockRes = {
      statusCode: 200,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("should process 'sale' listing type and return non-empty price ranges and cities", async () => {
    const mockAggregateData = [
      {
        total: [{ count: 2 }],
        cities: [
          { _id: "Bhubaneswar", count: 1 },
          { _id: "Hyderabad", count: 1 },
        ],
        prices: [{ price: 7200000 }, { price: 9800000 }],
        propertyTypes: [
          { _id: "apartment", count: 1 },
          { _id: "flat", count: 1 },
        ],
      },
    ];

    jest.spyOn(Property, "aggregate").mockResolvedValue(mockAggregateData);

    mockReq = {
      query: { listingType: "sale" },
    };

    await getFilterOptions(mockReq, mockRes);

    expect(mockRes.statusCode).toBe(200);
    expect(mockRes.json).toHaveBeenCalled();

    const result = mockRes.json.mock.calls[0][0];
    expect(result.success).toBe(true);
    expect(result.data.listingType).toBe("sale");
    expect(result.data.totalProperties).toBe(2);
    expect(result.data.cities).toEqual([
      { name: "Bhubaneswar", count: 1 },
      { name: "Hyderabad", count: 1 },
    ]);

    // Ensure all returned price ranges have count > 0
    expect(result.data.priceRanges.length).toBeGreaterThan(0);
    result.data.priceRanges.forEach((range) => {
      expect(range.count).toBeGreaterThan(0);
    });

    // Check that ₹50 Lakh – ₹1 Crore captures both 72L and 98L
    const lakhRange = result.data.priceRanges.find(
      (r) => r.key === "5000000-10000000"
    );
    expect(lakhRange).toBeDefined();
    expect(lakhRange.count).toBe(2);

    // Price stats
    expect(result.data.priceStats).toEqual({
      min: 7200000,
      max: 9800000,
      avg: 8500000,
    });
  });

  it("should normalize 'buy' query parameter to 'sale'", async () => {
    const aggregateSpy = jest
      .spyOn(Property, "aggregate")
      .mockResolvedValue([{ total: [], cities: [], prices: [], propertyTypes: [] }]);

    mockReq = {
      query: { listingType: "buy" },
    };

    await getFilterOptions(mockReq, mockRes);

    expect(aggregateSpy).toHaveBeenCalledWith([
      { $match: { purpose: "sale" } },
      expect.any(Object),
    ]);
    const result = mockRes.json.mock.calls[0][0];
    expect(result.data.listingType).toBe("sale");
  });

  it("should process 'rent' listing type with monthly rental brackets", async () => {
    const mockRentData = [
      {
        total: [{ count: 3 }],
        cities: [
          { _id: "Candolim", count: 1 },
          { _id: "Mumbai", count: 1 },
          { _id: "Pune", count: 1 },
        ],
        prices: [{ price: 22000 }, { price: 28000 }, { price: 45000 }],
        propertyTypes: [{ _id: "flat", count: 2 }, { _id: "apartment", count: 1 }],
      },
    ];

    jest.spyOn(Property, "aggregate").mockResolvedValue(mockRentData);

    mockReq = {
      query: { listingType: "rent" },
    };

    await getFilterOptions(mockReq, mockRes);

    const result = mockRes.json.mock.calls[0][0];
    expect(result.success).toBe(true);
    expect(result.data.listingType).toBe("rent");
    expect(result.data.totalProperties).toBe(3);

    // Should contain Under ₹25,000/mo (count 1: 22000) and ₹25,000 – ₹50,000/mo (count 2: 28000, 45000)
    const under25k = result.data.priceRanges.find((r) => r.key === "0-25000");
    const mid25to50 = result.data.priceRanges.find((r) => r.key === "25000-50000");

    expect(under25k).toBeDefined();
    expect(under25k.count).toBe(1);
    expect(mid25to50).toBeDefined();
    expect(mid25to50.count).toBe(2);

    // Empty brackets (e.g. above 2L) must NOT be present
    const above2L = result.data.priceRanges.find((r) => r.key === "200000-above");
    expect(above2L).toBeUndefined();
  });

  it("should process 'lease' listing type safely when no records exist", async () => {
    jest.spyOn(Property, "aggregate").mockResolvedValue([
      {
        total: [],
        cities: [],
        prices: [],
        propertyTypes: [],
      },
    ]);

    mockReq = {
      query: { listingType: "lease" },
    };

    await getFilterOptions(mockReq, mockRes);

    const result = mockRes.json.mock.calls[0][0];
    expect(result.success).toBe(true);
    expect(result.data.listingType).toBe("lease");
    expect(result.data.totalProperties).toBe(0);
    expect(result.data.cities).toEqual([]);
    expect(result.data.priceRanges).toEqual([]);
    expect(result.data.priceStats).toBeNull();
  });

  it("should safely handle null, undefined, or invalid price values", async () => {
    const mockCorruptData = [
      {
        total: [{ count: 3 }],
        cities: [{ _id: "Delhi", count: 3 }],
        prices: [{ price: 60000 }, { price: null }, { price: -500 }, { price: undefined }],
        propertyTypes: [{ _id: "villa", count: 1 }],
      },
    ];

    jest.spyOn(Property, "aggregate").mockResolvedValue(mockCorruptData);

    mockReq = {
      query: { listingType: "rent" },
    };

    await getFilterOptions(mockReq, mockRes);

    const result = mockRes.json.mock.calls[0][0];
    expect(result.success).toBe(true);
    expect(result.data.priceStats).toEqual({
      min: 60000,
      max: 60000,
      avg: 60000,
    });
  });
});
