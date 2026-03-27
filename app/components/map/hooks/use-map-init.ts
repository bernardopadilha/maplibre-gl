"use client";

import type { Map as MapLibreMap } from "maplibre-gl";
import maplibregl from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  mapStyleUrl,
} from "../map-constants";
import type { EmptyMapClickPayload } from "../map-interactions";
import {
  bindStyleImageMissingFallback,
  registerMapUiAfterLoad,
} from "../map-interactions";

interface UseMapInitOptions {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onEmptyMapClick: (payload: EmptyMapClickPayload) => void;
}

export function useMapInit({ containerRef, onEmptyMapClick }: UseMapInitOptions) {
  const mapRef = useRef<MapLibreMap | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const onEmptyMapClickRef = useRef(onEmptyMapClick);
  useEffect(() => {
    onEmptyMapClickRef.current = onEmptyMapClick;
  }, [onEmptyMapClick]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const map = new maplibregl.Map({
      container: root,
      style: mapStyleUrl(),
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM - 7,
    });

    mapRef.current = map;
    bindStyleImageMissingFallback(map);

    map.once("load", () => {
      setMapLoaded(true);
      registerMapUiAfterLoad(map, (payload) =>
        onEmptyMapClickRef.current(payload)
      );
    });

    return () => {
      map.remove();
      mapRef.current = null;
      setMapLoaded(false);
    };
  }, [containerRef]);

  return { mapRef, mapLoaded };
}
