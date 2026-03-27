import type { GeoJsonFeature } from "@/types/geojson";

export type PendingMapPoint = {
  lng: number;
  lat: number;
};

export type SheetFeatureMode = "create" | "edit";

export type SheetCreateFeatureProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: SheetFeatureMode;
  initialPoint: PendingMapPoint | null;
  editingFeature: GeoJsonFeature | null;
  draftSessionId: number;
  onLiveCoordinates?: (lng: number, lat: number) => void;
  onSuccess: () => void | Promise<void>;
};
