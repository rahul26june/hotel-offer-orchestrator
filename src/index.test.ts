import request from "supertest";
import app from "./index"; // export app from index.ts instead of calling listen()

// Mock Redis
jest.mock("ioredis", () => {
  return jest.fn().mockImplementation(() => ({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue("OK"),
    ping: jest.fn().mockResolvedValue("PONG"),
  }));
});

// Mock Temporal
jest.mock("@temporalio/client", () => {
  return {
    Connection: {
      connect: jest.fn().mockResolvedValue({}),
    },
    Client: jest.fn().mockImplementation(() => ({
      workflow: {
        start: jest.fn().mockResolvedValue({
          result: jest.fn().mockResolvedValue([
            { name: "Taj Palace", city: "delhi", price: 200 },
            { name: "Oberoi", city: "delhi", price: 150 },
          ]),
        }),
      },
    })),
  };
});

describe("Express API", () => {
  it("should return 400 if city is missing", async () => {
    const res = await request(app).get("/api/hotels");
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("city is required");
  });

  it("should return hotels from Temporal workflow when cache miss", async () => {
    const res = await request(app).get("/api/hotels?city=delhi");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].name).toBe("Taj Palace");
  });

  it("should apply price filtering", async () => {
    const res = await request(app).get("/api/hotels?city=delhi&maxPrice=160");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("Oberoi");
  });

  it("should return supplierA hotels", async () => {
    const res = await request(app).get("/supplierA/hotels");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should return health check ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.redis).toBe("connected");
  });
});
