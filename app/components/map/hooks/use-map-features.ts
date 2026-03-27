"use client";

import type { FeatureCollection } from "@/types/geojson";
import type maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";
import { useEffect } from "react";
import { attachInternalIdsForMap } from "../geojson-for-map";
import {
  FEATURES_SOURCE_ID,
  setFeatureHighlightFilter,
} from "../map-features-layers";

interface UseMapFeaturesOptions {
  mapRef: React.RefObject<MapLibreMap | null>;
  mapLoaded: boolean;
  featureCollection: FeatureCollection | null;
  highlightedFeatureId: string | null;
}

export function useMapFeatures({
  mapRef,
  mapLoaded,
  featureCollection,
  highlightedFeatureId,
}: UseMapFeaturesOptions) {
  // Sync featureCollection → source GeoJSON
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !featureCollection) return;

    const source = map.getSource(FEATURES_SOURCE_ID) as
      | maplibregl.GeoJSONSource
      | undefined;

    if (source) {
      source.setData(
        attachInternalIdsForMap(featureCollection) as unknown as FeatureCollection
      );
    }
  }, [featureCollection, mapLoaded, mapRef]);

  // Sync highlightedFeatureId → filtro nas layers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;
    setFeatureHighlightFilter(map, highlightedFeatureId);
  }, [highlightedFeatureId, mapLoaded, mapRef]);
}
