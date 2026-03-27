import type { FeatureCollection, GeoJsonFeature } from "@/types/geojson";

export const FEATURE_INTERNAL_ID_KEY = "__featureId";

export function attachInternalIdsForMap(fc: FeatureCollection): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: fc.features.map(attachInternalIdToFeature),
  };
}

function attachInternalIdToFeature(f: GeoJsonFeature): GeoJsonFeature {
  return {
    ...f,
    properties: {
      ...f.properties,
      [FEATURE_INTERNAL_ID_KEY]: f.id,
    },
  };
}
