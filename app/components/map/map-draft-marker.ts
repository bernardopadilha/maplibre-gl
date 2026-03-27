import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import maplibregl from "maplibre-gl";

function buildDraftMarkerElement() {
  const wrapper = document.createElement("div");
  wrapper.style.width = "28px";
  wrapper.style.height = "28px";
  wrapper.style.borderRadius = "50%";
  wrapper.style.background = "rgba(255, 105, 0, 0.12)";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";

  const el = document.createElement("div");
  el.style.width = "16px";
  el.style.height = "16px";
  el.style.borderRadius = "50%";
  el.style.background = "#ff6900";
  el.style.border = "3px solid white";
  el.style.boxShadow = "0 0 8px rgba(0,0,0,0.35)";

  wrapper.appendChild(el);
  wrapper.title = "Posição do ponto (criação ou edição)";
  return wrapper;
}

export function setDraftMarker(
  markerRef: { current: Marker | null },
  map: MapLibreMap,
  lng: number,
  lat: number
) {
  if (!markerRef.current) {
    markerRef.current = new maplibregl.Marker({
      element: buildDraftMarkerElement(),
    })
      .setLngLat([lng, lat])
      .addTo(map);
  } else {
    markerRef.current.setLngLat([lng, lat]);
  }
}

export function removeDraftMarker(markerRef: { current: Marker | null }) {
  markerRef.current?.remove();
  markerRef.current = null;
}
