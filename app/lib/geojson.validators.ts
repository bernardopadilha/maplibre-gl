import { geoJsonFeatureSchema } from "./geojson.schema";

export function validateGeoJsonFeature(data: unknown) {
  return geoJsonFeatureSchema.safeParse(data)
}