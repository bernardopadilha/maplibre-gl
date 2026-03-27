import type { FilterSpecification, Map as MapLibreMap } from "maplibre-gl";
import { FEATURE_INTERNAL_ID_KEY } from "./geojson-for-map";

export const FEATURES_SOURCE_ID = "features";
export const FEATURES_POINT_LAYER_ID = "points";
export const FEATURES_HALO_LAYER_ID = "points-halo";
export const FEATURES_SELECTED_HALO_LAYER_ID = "points-selected-halo";
export const FEATURES_SELECTED_POINT_LAYER_ID = "points-selected-dot";

export function addFeaturesSourceAndLayers(map: MapLibreMap) {
  map.addSource(FEATURES_SOURCE_ID, {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });

  map.addLayer({
    id: FEATURES_HALO_LAYER_ID,
    type: "circle",
    source: FEATURES_SOURCE_ID,
    paint: {
      "circle-radius": 14,
      "circle-color": "#ff6900",
      "circle-opacity": 0.1,
    },
  });

  map.addLayer({
    id: FEATURES_POINT_LAYER_ID,
    type: "circle",
    source: FEATURES_SOURCE_ID,
    paint: {
      "circle-radius": 6,
      "circle-color": "#ff6900",
    },
  });
}

export function setFeatureHighlightFilter(
  map: MapLibreMap,
  featureId: string | null
) {
  const filter: FilterSpecification = featureId
    ? (["==", ["get", FEATURE_INTERNAL_ID_KEY], featureId])
    : (["==", ["get", FEATURE_INTERNAL_ID_KEY], "___none___"]);

  if (map.getLayer(FEATURES_SELECTED_HALO_LAYER_ID)) {
    map.setFilter(FEATURES_SELECTED_HALO_LAYER_ID, filter);
  }
  if (map.getLayer(FEATURES_SELECTED_POINT_LAYER_ID)) {
    map.setFilter(FEATURES_SELECTED_POINT_LAYER_ID, filter);
  }
}
