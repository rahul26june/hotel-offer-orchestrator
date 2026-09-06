import { THotel } from "./types";
import { supplierAHotels } from "./suppliers/supplierA";
import { supplierBHotels } from "./suppliers/supplierB";

export function orchestrate(city: string): THotel[] {
  const supplierA = supplierAHotels.filter(h => h.city === city);
  const supplierB = supplierBHotels.filter(h => h.city === city);

  //console.log("supplierA", supplierA);
  //console.log("supplierB", supplierB);

  const merged: Record<string, THotel> = {};

  [...supplierA, ...supplierB].forEach(hotel => {
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