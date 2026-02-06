"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const guessIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background:#ef4444;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const actualIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background:#22c55e;width:20px;height:20px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function FitBounds({
  guessLat,
  guessLng,
  actualLat,
  actualLng,
}: {
  guessLat: number;
  guessLng: number;
  actualLat: number;
  actualLng: number;
}) {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!fitted.current) {
      const bounds = L.latLngBounds(
        [guessLat, guessLng],
        [actualLat, actualLng]
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
      fitted.current = true;
    }
  }, [map, guessLat, guessLng, actualLat, actualLng]);

  return null;
}

interface RoundResultMapProps {
  guessLat: number;
  guessLng: number;
  actualLat: number;
  actualLng: number;
}

export default function RoundResultMap({
  guessLat,
  guessLng,
  actualLat,
  actualLng,
}: RoundResultMapProps) {
  return (
    <MapContainer
      center={[actualLat, actualLng]}
      zoom={4}
      style={{ width: "100%", height: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <FitBounds
        guessLat={guessLat}
        guessLng={guessLng}
        actualLat={actualLat}
        actualLng={actualLng}
      />
      <Marker position={[guessLat, guessLng]} icon={guessIcon} />
      <Marker position={[actualLat, actualLng]} icon={actualIcon} />
      <Polyline
        positions={[
          [guessLat, guessLng],
          [actualLat, actualLng],
        ]}
        color="#818cf8"
        weight={3}
        dashArray="8,8"
      />
    </MapContainer>
  );
}
