export function formatCoord(n: number) {
  return n.toFixed(6);
}

export function parseCoordInput(raw: string) {
  const normalized = raw.trim().replace(",", ".");
  if (normalized === "" || normalized === "-") return null;
  const n = Number.parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

export function isValidGeoPosition(lng: number, lat: number) {
  return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
}
