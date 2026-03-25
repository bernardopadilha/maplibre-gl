import type { FeatureCollection, GeoJsonFeature } from "@/types/geojson";

export function generateId() {
  return crypto.randomUUID();
}

export function toFeatureCollection(
  features: GeoJsonFeature[]
): FeatureCollection {
  return {
    type: "FeatureCollection",
    features,
  };
}