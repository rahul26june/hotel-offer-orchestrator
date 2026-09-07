import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "./activities";
import { THotel } from "./types";

export async function hotelWorkflow(city: string) {
const { fetchSupplierA, fetchSupplierB } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute"
});

const [aHotels, bHotels] = await Promise.all([
    fetchSupplierA(city),
    fetchSupplierB(city)
  ]);

  const merged: Record<string, THotel> = {};

  [...aHotels, ...bHotels].forEach(hotel => {
    if (!merged[hotel.name]) {
      merged[hotel.name] = hotel;
    } else {
      if (hotel.price < merged[hotel.name]!.price) {
        merged[hotel.name] = hotel;
      }
    }
  });

  return Object.values(merged);
}