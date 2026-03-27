import type { ReverseGeocodePayload } from "@/types/reverse-geocode";

const cache = new Map<string, ReverseGeocodePayload | null>();

function key(lat: number, lng: number) {
  return `${lat.toFixed(5)},${lng.toFixed(5)}`;
}

export async function fetchReverseGeocode(
  lat: number,
  lng: number
): Promise<ReverseGeocodePayload | null> {
  const k = key(lat, lng);
  if (cache.has(k)) {
    return cache.get(k) ?? null;
  }

  try {
    const res = await fetch(
      `/api/reverse-geocode?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`
    );

    if (!res.ok) {
      cache.set(k, null);
      return null;
    }

    const data = (await res.json()) as ReverseGeocodePayload;
    cache.set(k, data);
    return data;
  } catch {
    cache.set(k, null);
    return null;
  }
}