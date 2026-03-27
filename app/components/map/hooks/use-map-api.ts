"use client";

import type { MapSurfaceApi } from "@/contexts/map-context";
import { readGeolocationStoredState } from "@/lib/geolocation-consent.storage";
import { getBrowserGeolocationGate } from "@/lib/geolocation-permission";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import maplibregl from "maplibre-gl";
import { useEffect } from "react";
import { toast } from "sonner";
import { DRAFT_VIEW_MIN_ZOOM } from "../map-constants";
import { removeDraftMarker, setDraftMarker } from "../map-draft-marker";
import { createUserLocationMarkerElement } from "../map-interactions";

interface UseMapApiOptions {
  mapRef: React.RefObject<MapLibreMap | null>;
  mapLoaded: boolean;
  mapApiRef: React.RefObject<MapSurfaceApi | null>;
  draftMarkerRef: React.RefObject<Marker | null>;
  userLocationMarkerRef: React.RefObject<maplibregl.Marker | null>;
}

export function useMapApi({
  mapRef,
  mapLoaded,
  mapApiRef,
  draftMarkerRef,
  userLocationMarkerRef,
}: UseMapApiOptions) {
  useEffect(() => {
    if (!mapLoaded) return;
    const map = mapRef.current;
    if (!map) return;

    const placeUserLocationMarkerAndFly = (
      surface: MapLibreMap,
      lng: number,
      lat: number
    ) => {
      userLocationMarkerRef.current?.remove();
      userLocationMarkerRef.current = new maplibregl.Marker({
        element: createUserLocationMarkerElement(),
      })
        .setLngLat([lng, lat])
        .addTo(surface);

      surface.flyTo({
        center: [lng, lat],
        zoom: Math.max(surface.getZoom(), 15),
        speed: 1.2,
      });
    };

    mapApiRef.current = {
      flyTo: (lng, lat) => {
        map.flyTo({
          center: [lng, lat],
          zoom: Math.max(map.getZoom(), DRAFT_VIEW_MIN_ZOOM),
          speed: 1.2,
        });
      },

      setDraftMarker: (lng, lat) => {
        setDraftMarker(draftMarkerRef, map, lng, lat);
      },

      clearDraftMarker: () => {
        removeDraftMarker(draftMarkerRef);
      },

      showUserLocationAt: (lng, lat) => {
        const surface = mapRef.current;
        if (!surface) return;
        placeUserLocationMarkerAndFly(surface, lng, lat);
      },

      flyToMyLocation: () =>
        new Promise<void>((resolve, reject) => {
          if (!navigator.geolocation) {
            toast.error("Seu navegador não suporta geolocalização.");
            reject(new Error("unsupported"));
            return;
          }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const lng = position.coords.longitude;
              const lat = position.coords.latitude;
              const surface = mapRef.current;
              if (!surface) {
                reject(new Error("map-unmounted"));
                return;
              }
              placeUserLocationMarkerAndFly(surface, lng, lat);
              resolve();
            },
            (error) => {
              const denied = error.code === 1;
              toast.error(
                denied
                  ? "Permissão de localização negada."
                  : "Não foi possível obter sua localização."
              );
              reject(error);
            },
            { enableHighAccuracy: true }
          );
        }),
    };

    void (async () => {
      if (readGeolocationStoredState().appConsent !== "granted") return;

      const gate = await getBrowserGeolocationGate();
      if (gate !== "granted") return;

      if (!navigator.geolocation) return;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lng = position.coords.longitude;
          const lat = position.coords.latitude;
          const m = mapRef.current;
          if (!m) return;
          placeUserLocationMarkerAndFly(m, lng, lat);
        },
        (error) => {
          const denied = error.code === 1;
          if (denied) {
            toast.error("Permissão de localização negada.");
          }
        },
        { enableHighAccuracy: true }
      );
    })();

    return () => {
      mapApiRef.current = null;
    };
  }, [mapLoaded, mapRef, mapApiRef, draftMarkerRef, userLocationMarkerRef]);
}
