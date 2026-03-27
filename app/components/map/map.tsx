"use client";

import { useFeature } from "@/contexts/feature-context";
import { useMap } from "@/contexts/map-context";
import type { Marker } from "maplibre-gl";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useRef } from "react";
import { useDraftMarker } from "./hooks/use-draft-marker";
import { useMapApi } from "./hooks/use-map-api";
import { useMapFeatures } from "./hooks/use-map-features";
import { useMapInit } from "./hooks/use-map-init";

export function Map() {
  const {
    featureCollection,
    highlightedFeatureId,
    openSheetFromMapClick,
    sheetOpen,
    sheetInitialPoint,
  } = useFeature();
  const { mapApiRef } = useMap();

  const flyToLngLat = useCallback((lng: number, lat: number) => {
    mapApiRef.current?.flyTo(lng, lat);
  }, [mapApiRef]);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const draftMarkerRef = useRef<Marker | null>(null);
  const userLocationMarkerRef = useRef<maplibregl.Marker | null>(null);

  const { mapRef, mapLoaded } = useMapInit({
    containerRef: mapContainerRef,
    onEmptyMapClick: openSheetFromMapClick,
  });

  useMapApi({
    mapRef,
    mapLoaded,
    mapApiRef,
    draftMarkerRef,
    userLocationMarkerRef,
  });

  useMapFeatures({
    mapRef,
    mapLoaded,
    featureCollection,
    highlightedFeatureId,
  });

  useDraftMarker({
    mapRef,
    mapLoaded,
    draftMarkerRef,
    sheetOpen,
    sheetInitialPoint,
    flyToLngLat,
  });

  return (
    <div
      ref={mapContainerRef}
      className="absolute inset-0 z-0 h-screen w-full"
    />
  );
}