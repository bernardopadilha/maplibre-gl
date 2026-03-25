"use client";

import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

export function Map() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `/api/map-style`,
      center: [-49.3531639, -28.6974982],
      zoom: 12,
    });

    mapRef.current = map;

    map.on("load", () => {
      if (!navigator.geolocation) {
        console.log("Geolocalização não suportada");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lng = position.coords.longitude;
          const lat = position.coords.latitude;

          map.flyTo({
            center: [lng, lat],
            zoom: 15,
            speed: 1.2,
          });

          const el = document.createElement("div");
          el.style.width = "18px";
          el.style.height = "18px";
          el.style.borderRadius = "50%";
          el.style.background = "#1E90FF";
          el.style.border = "3px solid white";
          el.style.boxShadow = "0 0 8px rgba(0,0,0,0.4)";

          new maplibregl.Marker({ element: el })
            .setLngLat([lng, lat])
            .addTo(map);

          console.log("Localização:", { lng, lat });
        },
        (error) => {
          console.log("Erro ao obter localização:", error.message);
        },
        {
          enableHighAccuracy: true,
        }
      );
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <div
      ref={mapContainer}
      style={{ width: "100%", height: "100vh" }}
    />
  );
}