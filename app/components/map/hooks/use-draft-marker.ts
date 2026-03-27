"use client";

import type { PendingMapPoint } from "@/components/sheet-create-feature";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { useEffect } from "react";
import { removeDraftMarker, setDraftMarker } from "../map-draft-marker";

interface UseDraftMarkerOptions {
  mapRef: React.RefObject<MapLibreMap | null>;
  mapLoaded: boolean;
  draftMarkerRef: React.RefObject<Marker | null>;
  sheetOpen: boolean;
  sheetInitialPoint: PendingMapPoint | null;
  flyToLngLat: (lng: number, lat: number) => void;
}

export function useDraftMarker({
  mapRef,
  mapLoaded,
  draftMarkerRef,
  sheetOpen,
  sheetInitialPoint,
  flyToLngLat,
}: UseDraftMarkerOptions) {
  useEffect(() => {
    if (!sheetOpen) {
      removeDraftMarker(draftMarkerRef);
      return;
    }

    if (!sheetInitialPoint) return;
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const { lng, lat } = sheetInitialPoint;
    setDraftMarker(draftMarkerRef, map, lng, lat);

    queueMicrotask(() => {
      if (!mapRef.current) return;
      flyToLngLat(lng, lat);
    });
  }, [sheetOpen, sheetInitialPoint, mapLoaded, mapRef, draftMarkerRef, flyToLngLat]);
}
