import type { GeoJsonFeature } from "@/types/geojson";
import { formatCoord } from "./coord-utils";
import type { PendingMapPoint, SheetFeatureMode } from "./types";

export function buildSheetFeatureDefaultValues(
  mode: SheetFeatureMode,
  initialPoint: PendingMapPoint | null,
  editingFeature: GeoJsonFeature | null
) {
  if (mode === "edit" && editingFeature?.geometry.type === "Point") {
    const [lng, lat] = editingFeature.geometry.coordinates;
    return {
      lngStr: formatCoord(lng),
      latStr: formatCoord(lat),
      name: editingFeature.properties.name,
      description: editingFeature.properties.description ?? "",
    };
  }
  if (initialPoint) {
    return {
      lngStr: formatCoord(initialPoint.lng),
      latStr: formatCoord(initialPoint.lat),
      name: "",
      description: "",
    };
  }
  return {
    lngStr: "",
    latStr: "",
    name: "",
    description: "",
  };
}
