import express from "express";
import Redis from "ioredis";
import { Connection, Client } from "@temporalio/client";
import { supplierAHotels } from "./suppliers/supplierA";
import { supplierBHotels } from "./suppliers/supplierB";
import { THotel } from "./types";

const app = express();
const redis = new Redis({ host: process.env.REDIS_HOST || "localhost", port: 6379 });

app.get("/api/hotels", async (req, res) => {
  const { city, minPrice, maxPrice } = req.query;
  if (!city) return res.status(400).json({ error: "city is required" });

  const cacheKey = `hotels:${city}`;
  let hotels: THotel[] = [];

  // Try Redis cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log("Cache HIT for", cacheKey);
    hotels = JSON.parse(cached) as THotel[];
  } else {
    // Run Temporal workflow
    console.log("Cache Miss for", cacheKey);
    const connection = await Connection.connect({
      address: process.env.TEMPORAL_ADDRESS || "localhost:7233"
    });
    const client = new Client({ connection });
    const handle = await client.workflow.start("hotelWorkflow", {
      args: [city],
      taskQueue: "hotel-task-queue",
      workflowId: `hotel-${city}-${Date.now()}`
    });
    hotels = await handle.result();

    await redis.set(cacheKey, JSON.stringify(hotels), "EX", 3600);

  }

  // Apply price filtering
  let filtered = hotels;
  if (minPrice || maxPrice) {
    const min = minPrice ? parseInt(minPrice as string) : 0;
    const max = maxPrice ? parseInt(maxPrice as string) : Number.MAX_SAFE_INTEGER;
    filtered = hotels.filter(h => h.price >= min && h.price <= max);
  }

  res.json(filtered);
});

// Supplier data
app.get("/supplierA/hotels", (req, res) => res.json(supplierAHotels));
app.get("/supplierB/hotels", (req, res) => res.json(supplierBHotels));

// Health check
app.get("/health", async (_, res) => {
  try {
    await redis.ping();
    res.json({ status: "ok", redis: "connected" });
  } catch {
    res.json({ status: "error", redis: "not connected" });
  }
});

//app.listen(PORT, () => console.log(`Server running on ${PORT}`));

export default app;