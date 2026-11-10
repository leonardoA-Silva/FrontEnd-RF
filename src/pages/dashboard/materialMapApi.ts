import axios from "axios";
import api from "../../axios/Axios";
import { parseProduct } from "../company/companyApi";
import { object, string } from "../company/companyResourceApi";
import { uuidPattern, type CompanyProduct } from "../company/companyTypes";

export interface MapListing { product: CompanyProduct; city: string; neighborhood: string; lat: number; lng: number }
export interface MaterialMapData { listings: MapListing[]; withoutCoordinates: number; unavailable: number }
export async function loadMaterialMap(signal: AbortSignal): Promise<MaterialMapData> {
  const { data } = await api.get<unknown>("/product/", { signal });
  if (!Array.isArray(data)) throw new Error("Invalid product list");
  const products = data.map(parseProduct);
  if (products.some(product => product === null)) throw new Error("Invalid product");
  const available = products.filter((product): product is CompanyProduct => product !== null && product.status === "available" && product.quantity > 0);
  const result: MaterialMapData = { listings: [], withoutCoordinates: 0, unavailable: 0 };
  // Limit concurrent lookups. Missing coordinates never receive invented positions.
  for (let offset = 0; offset < available.length; offset += 6) {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const batch = available.slice(offset, offset + 6);
    const responses = await Promise.allSettled(batch.map(async product => {
      const { data } = await api.get<unknown>(`/localization/product/${encodeURIComponent(product.id)}`, { signal });
      const row = object(data);
      if (!uuidPattern.test(string(row.productId)) || string(row.productId).toLowerCase() !== product.id.toLowerCase()) throw new Error("Invalid location");
      if (row.latitude == null || row.longitude == null) return null;
      const lat = Number(row.latitude), lng = Number(row.longitude);
      if (![row.latitude, row.longitude].every(v => (typeof v === "number" || typeof v === "string" && !!v.trim())) || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new Error("Invalid coordinates");
      // Keep only approximate coordinates and public area labels in map state,
      // including when the server authorizes full address access for the owner.
      return { product, city: string(row.city), neighborhood: string(row.neighborhood), lat: Math.round(lat * 100) / 100, lng: Math.round(lng * 100) / 100 };
    }));
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    responses.forEach(response => {
      if (response.status === "fulfilled") {
        if (response.value) result.listings.push(response.value); else result.withoutCoordinates++;
      } else {
        if (axios.isAxiosError(response.reason) && response.reason.response?.status === 404) result.withoutCoordinates++;
        else result.unavailable++;
      }
    });
  }
  return result;
}
