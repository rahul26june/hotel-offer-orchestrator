import express from "express";
import Redis from "ioredis";
import {orchestrate} from "./hotel_orchestrator";
import { supplierAHotels } from "./suppliers/supplierA";
import { supplierBHotels } from "./suppliers/supplierB";

const app = express();
const PORT = 3000;

const redis = new Redis({ host: "redis", port: 6379 });

app.get("/api/hotels", async(req:any, res:any) => {
  //const { city } = req.query;
  const { city, minPrice, maxPrice } = req.query;
  if (!city) return res.status(400).json({ error: "city is required" });

  const cacheKey = "hotels:" + city;
  let hotels:any[] = [];

  const cachedHotels = await redis.get(cacheKey);
  if (cachedHotels) {
    hotels = JSON.parse(cachedHotels);
  } else {
    hotels = orchestrate(city as string);
    await redis.set(cacheKey, JSON.stringify(hotels), "EX", 60 * 60); // Cache for 1 hour
  }

  //const hotels = orchestrate(city as string);
  let filteredHotels = hotels;
  if (minPrice || maxPrice) {
    const min = minPrice ? parseInt(minPrice as string) : 0;
    const max = maxPrice ? parseInt(maxPrice as string) : 100000;;
    filteredHotels = hotels.filter(h => h.price >= min && h.price <= max);
  }


  res.json(filteredHotels);
});

// Supplier data
app.get("/supplierA/hotels", (req: any, res: any) => res.json(supplierAHotels));
app.get("/supplierB/hotels", (req: any, res: any) => res.json(supplierBHotels));


// Health check
app.get("/health", async (_, res) => {
  try {
    await redis.ping();
    res.json({ status: "ok", redis: "connected" });
  } catch {
    res.json({ status: "error", redis: "not connected" });
  }
});

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
