import type { Map as MapLibreMap } from "maplibre-gl";
import maplibregl from "maplibre-gl";
import { fetchReverseGeocode } from "@/services/reverse-geocode";
import {
  FEATURES_POINT_LAYER_ID,
  addFeaturesSourceAndLayers,
} from "./map-features-layers";

export function bindStyleImageMissingFallback(map: MapLibreMap) {
  map.on("styleimagemissing", (e) => {
    if (map.hasImage(e.id)) return;
    try {
      map.addImage(e.id, {
        width: 1,
        height: 1,
        data: new Uint8Array([0, 0, 0, 0]),
      });
    } catch {
      /* ignore */
    }
  });
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildPopupHtml(
  name: string,
  description: string
) {
  return `
<div class="map-popup-inner text-sm max-w-[260px]">
  <strong class="text-foreground">${escapeHtml(name)}</strong>
  ${description ? `<div class="mt-1 text-muted-foreground">${escapeHtml(description)}</div>` : ""}
  <div data-popup-address class="mt-2 text-xs text-muted-foreground leading-snug">Carregando endereço…</div>
</div>`;
}

export function bindFeaturePopups(map: MapLibreMap) {
  map.on("click", FEATURES_POINT_LAYER_ID, (e) => {
    const feature = e.features?.[0];
    if (!feature || feature.geometry.type !== "Point") return;

    const coords = [...feature.geometry.coordinates] as [number, number];
    const name = String(feature.properties?.name ?? "");
    const description = String(feature.properties?.description ?? "");
    const [lng, lat] = coords;

    const popup = new maplibregl.Popup({ maxWidth: "280px" })
      .setLngLat(coords)
      .setHTML(buildPopupHtml(name, description))
      .addTo(map);

    void (async () => {
      const addr = await fetchReverseGeocode(lat, lng);
      const root = popup.getElement()?.querySelector("[data-popup-address]");
      if (!root) return;
      if (!addr || (!addr.road && !addr.suburb && !addr.city)) {
        root.textContent = "Endereço indisponível.";
        return;
      }
      root.innerHTML = [
        addr.road ? `<span class="block">${escapeHtml(addr.road)}</span>` : "",
        addr.suburb
          ? `<span class="block">${escapeHtml(addr.suburb)}</span>`
          : "",
        addr.city ? `<span class="block">${escapeHtml(addr.city)}</span>` : "",
      ]
        .filter(Boolean)
        .join("");
    })();
  });
}

export function createUserLocationMarkerElement() {
  const wrapper = document.createElement("div");
  wrapper.style.width = "30px";
  wrapper.style.height = "30px";
  wrapper.style.borderRadius = "50%";
  wrapper.style.background = "rgba(255, 105, 0, 0.1)";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";

  const el = document.createElement("div");
  el.style.width = "18px";
  el.style.height = "18px";
  el.style.borderRadius = "50%";
  el.style.background = "#ff6900";
  el.style.border = "3px solid white";
  el.style.boxShadow = "0 0 8px rgba(0,0,0,0.4)";

  wrapper.appendChild(el);
  return wrapper;
}

export type EmptyMapClickPayload = { lng: number; lat: number };

export function bindEmptyMapCreateClick(
  map: MapLibreMap,
  onEmptyClick: (payload: EmptyMapClickPayload) => void
) {
  map.on("click", (e) => {
    if (!map.getLayer(FEATURES_POINT_LAYER_ID)) return;

    const hits = map.queryRenderedFeatures(e.point, {
      layers: [FEATURES_POINT_LAYER_ID],
    });

    if (hits.length > 0) return;

    onEmptyClick({ lng: e.lngLat.lng, lat: e.lngLat.lat });
  });
}

export function registerMapUiAfterLoad(
  map: MapLibreMap,
  onEmptyMapClick: (payload: EmptyMapClickPayload) => void
) {
  addFeaturesSourceAndLayers(map);
  bindFeaturePopups(map);
  bindEmptyMapCreateClick(map, onEmptyMapClick);
}
