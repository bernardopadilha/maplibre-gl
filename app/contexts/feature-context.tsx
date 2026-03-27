"use client";

import { SheetCreateFeature, type PendingMapPoint, type SheetFeatureMode } from "@/components/sheet-create-feature";
import { GeoJsonApiError, fetchFeatureCollection } from "@/lib/geojson-api";
import type { FeatureCollection, GeoJsonFeature } from "@/types/geojson";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import { useMap } from "./map-context";

type FeatureContextValue = {
  featureCollection: FeatureCollection | null;
  refreshFeatures: () => Promise<void>;
  highlightedFeatureId: string | null;
  setHighlightedFeatureId: React.Dispatch<React.SetStateAction<string | null>>;
  focusFeatureOnMap: (featureId: string) => void;
  openSheetFromMapClick: (point: PendingMapPoint) => void;
  openSheetManualCreate: () => void;
  openSheetEdit: (feature: GeoJsonFeature) => void;
  sheetOpen: boolean;
  setSheetOpen: (open: boolean) => void;
  sheetMode: SheetFeatureMode;
  sheetInitialPoint: PendingMapPoint | null;
  sheetEditingFeature: GeoJsonFeature | null;
  draftSessionId: number;
  liveCoordinatesFromSheet: (lng: number, lat: number) => void;
  featuresDrawerOpen: boolean;
  setFeaturesDrawerOpen: (open: boolean) => void;
};

const FeatureContext = createContext<FeatureContextValue | null>(null);

export function useFeature() {
  const ctx = useContext(FeatureContext);
  if (!ctx) {
    throw new Error("useFeature deve ser usado dentro de FeatureProvider");
  }
  return ctx;
}

/** Compat: um hook para telas que precisam de mapa + dados. */
export function useFeatureMap() {
  const feature = useFeature();
  const { mapApiRef, goToMyLocation } = useMap();
  return useMemo(
    () => ({
      ...feature,
      mapApiRef,
      goToMyLocation,
    }),
    [feature, mapApiRef, goToMyLocation]
  );
}

export function FeatureProvider({ children }: { children: React.ReactNode }) {
  const { mapApiRef } = useMap();
  const [featureCollection, setFeatureCollection] =
    useState<FeatureCollection | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<SheetFeatureMode>("create");
  const [sheetInitialPoint, setSheetInitialPoint] =
    useState<PendingMapPoint | null>(null);
  const [sheetEditingFeature, setSheetEditingFeature] =
    useState<GeoJsonFeature | null>(null);
  const [draftSessionId, setDraftSessionId] = useState(0);
  const [highlightedFeatureId, setHighlightedFeatureId] = useState<
    string | null
  >(null);
  const [featuresDrawerOpen, setFeaturesDrawerOpen] = useState(false);

  const refreshFeatures = useCallback(async () => {
    try {
      const data = await fetchFeatureCollection();
      setFeatureCollection(data);
    } catch (e) {
      const msg =
        e instanceof GeoJsonApiError ? e.message : "Erro ao buscar features";
      toast.error(msg);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchFeatureCollection();
        if (!cancelled) setFeatureCollection(data);
      } catch (e) {
        if (!cancelled) {
          const msg =
            e instanceof GeoJsonApiError
              ? e.message
              : "Erro ao buscar features";
          toast.error(msg);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const bumpSession = useCallback(() => {
    setDraftSessionId((n) => n + 1);
  }, []);

  const openSheetFromMapClick = useCallback(
    (point: PendingMapPoint) => {
      bumpSession();
      setSheetMode("create");
      setSheetEditingFeature(null);
      setSheetInitialPoint(point);
      setSheetOpen(true);
    },
    [bumpSession]
  );

  const openSheetManualCreate = useCallback(() => {
    bumpSession();
    setSheetMode("create");
    setSheetEditingFeature(null);
    setSheetInitialPoint(null);
    setSheetOpen(true);
  }, [bumpSession]);

  const openSheetEdit = useCallback(
    (feature: GeoJsonFeature) => {
      bumpSession();
      setSheetMode("edit");
      setSheetEditingFeature(feature);
      if (feature.geometry.type === "Point") {
        const [lng, lat] = feature.geometry.coordinates;
        setSheetInitialPoint({ lng, lat });
        setHighlightedFeatureId(feature.id);
      } else {
        setSheetInitialPoint(null);
      }
      setSheetOpen(true);
    },
    [bumpSession]
  );

  const liveCoordinatesFromSheet = useCallback((lng: number, lat: number) => {
    mapApiRef.current?.setDraftMarker(lng, lat);
    mapApiRef.current?.flyTo(lng, lat);
  }, [mapApiRef]);

  const focusFeatureOnMap = useCallback(
    (featureId: string) => {
      const f = featureCollection?.features.find((x) => x.id === featureId);
      if (!f || f.geometry.type !== "Point") return;
      const [lng, lat] = f.geometry.coordinates;
      setHighlightedFeatureId(featureId);
      mapApiRef.current?.flyTo(lng, lat);
    },
    [featureCollection?.features, mapApiRef]
  );

  const handleSheetOpenChange = useCallback(
    (open: boolean) => {
      setSheetOpen(open);
      if (!open) {
        setSheetEditingFeature(null);
        setSheetInitialPoint(null);
        mapApiRef.current?.clearDraftMarker();
      }
    },
    [mapApiRef]
  );

  const value = useMemo(
    () => ({
      featureCollection,
      refreshFeatures,
      highlightedFeatureId,
      setHighlightedFeatureId,
      focusFeatureOnMap,
      openSheetFromMapClick,
      openSheetManualCreate,
      openSheetEdit,
      sheetOpen,
      setSheetOpen,
      sheetMode,
      sheetInitialPoint,
      sheetEditingFeature,
      draftSessionId,
      liveCoordinatesFromSheet,
      featuresDrawerOpen,
      setFeaturesDrawerOpen,
    }),
    [
      featureCollection,
      refreshFeatures,
      highlightedFeatureId,
      focusFeatureOnMap,
      openSheetFromMapClick,
      openSheetManualCreate,
      openSheetEdit,
      sheetOpen,
      sheetMode,
      sheetInitialPoint,
      sheetEditingFeature,
      draftSessionId,
      liveCoordinatesFromSheet,
      featuresDrawerOpen,
    ]
  );

  return (
    <FeatureContext.Provider value={value}>
      {children}
      <SheetCreateFeature
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        mode={sheetMode}
        initialPoint={sheetInitialPoint}
        editingFeature={sheetEditingFeature}
        draftSessionId={draftSessionId}
        onLiveCoordinates={liveCoordinatesFromSheet}
        onSuccess={refreshFeatures}
      />
    </FeatureContext.Provider>
  );
}
