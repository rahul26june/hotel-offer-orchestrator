import { supplierAHotels } from "./suppliers/supplierA";
import { supplierBHotels } from "./suppliers/supplierB";
import { THotel } from "./types";

export async function fetchSupplierA(city: string): Promise<THotel[]> {
  return supplierAHotels.filter((h) => h.city === city);
}

export async function fetchSupplierB(city: string): Promise<THotel[]> {
  return supplierBHotels.filter((h) => h.city === city);
}
