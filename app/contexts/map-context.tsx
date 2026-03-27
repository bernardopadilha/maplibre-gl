"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { toast } from "sonner";

export type MapSurfaceApi = {
  flyTo: (lng: number, lat: number) => void;
  setDraftMarker: (lng: number, lat: number) => void;
  clearDraftMarker: () => void;
  /** Só após ação explícita do usuário (ex.: botão na sidebar). */
  flyToMyLocation: () => Promise<void>;
  /** Posição já obtida via Geolocation API (evita segunda leitura). */
  showUserLocationAt: (lng: number, lat: number) => void;
};

type MapContextValue = {
  mapApiRef: React.RefObject<MapSurfaceApi | null>;
  goToMyLocation: () => void;
  /**
   * Centraliza e mostra o marcador quando o mapa estiver pronto
   * (ex.: após aceitar localização no diálogo inicial).
   */
  showUserLocationAtWhenReady: (lng: number, lat: number) => void;
};

const MapContext = createContext<MapContextValue | null>(null);

export function useMap() {
  const ctx = useContext(MapContext);
  if (!ctx) {
    throw new Error("useMap deve ser usado dentro de MapProvider");
  }
  return ctx;
}

const MAP_API_RETRY_MS = 120;
const MAP_API_RETRY_MAX = 40;

export function MapProvider({ children }: { children: React.ReactNode }) {
  const mapApiRef = useRef<MapSurfaceApi | null>(null);

  const goToMyLocation = useCallback(() => {
    const api = mapApiRef.current;
    if (!api?.flyToMyLocation) {
      toast.info("Aguarde o mapa terminar de carregar.");
      return;
    }
    void api.flyToMyLocation().catch(() => { });
  }, []);

  const locationRetryTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );

  useEffect(() => {
    return () => {
      if (locationRetryTimerRef.current !== null) {
        clearInterval(locationRetryTimerRef.current);
      }
    };
  }, []);

  const showUserLocationAtWhenReady = useCallback((lng: number, lat: number) => {
    const tryShow = () => {
      const api = mapApiRef.current;
      if (api?.showUserLocationAt) {
        api.showUserLocationAt(lng, lat);
        return true;
      }
      return false;
    };

    if (tryShow()) return;

    if (locationRetryTimerRef.current !== null) {
      clearInterval(locationRetryTimerRef.current);
    }

    let attempts = 0;
    locationRetryTimerRef.current = setInterval(() => {
      attempts += 1;
      if (tryShow() || attempts >= MAP_API_RETRY_MAX) {
        if (locationRetryTimerRef.current !== null) {
          clearInterval(locationRetryTimerRef.current);
          locationRetryTimerRef.current = null;
        }
        if (attempts >= MAP_API_RETRY_MAX && !mapApiRef.current?.showUserLocationAt) {
          toast.info("Aguarde o mapa terminar de carregar.");
        }
      }
    }, MAP_API_RETRY_MS);
  }, []);

  const value = useMemo(
    () => ({
      mapApiRef,
      goToMyLocation,
      showUserLocationAtWhenReady,
    }),
    [goToMyLocation, showUserLocationAtWhenReady]
  );

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
}
