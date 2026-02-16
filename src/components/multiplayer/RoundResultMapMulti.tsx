"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface GuessWithColor {
  playerName: string;
  guessLat: number;
  guessLng: number;
  distance: number;
  score: number;
  color: string;
}

interface RoundResultMapMultiProps {
  actualLat: number;
  actualLng: number;
  guesses: GuessWithColor[];
}

function createColoredIcon(color: string, size: number = 12) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 0 6px ${color}80;"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const actualIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#10B981;border:3px solid white;box-shadow:0 0 8px #10B98180;"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function FitBounds({
  actualLat,
  actualLng,
  guesses,
}: {
  actualLat: number;
  actualLng: number;
  guesses: GuessWithColor[];
}) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [
      [actualLat, actualLng],
      ...guesses
        .filter((g) => g.distance >= 0)
        .map((g): [number, number] => [g.guessLat, g.guessLng]),
    ];

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [30, 30] });
    } else if (points.length === 1) {
      map.setView(points[0], 5);
    }
  }, [map, actualLat, actualLng, guesses]);

  return null;
}

export default function RoundResultMapMulti({
  actualLat,
  actualLng,
  guesses,
}: RoundResultMapMultiProps) {
  const validGuesses = guesses.filter((g) => g.distance >= 0);

  return (
    <MapContainer
      center={[actualLat, actualLng]}
      zoom={3}
      className="w-full h-full"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds
        actualLat={actualLat}
        actualLng={actualLng}
        guesses={validGuesses}
      />

      {/* Actual location */}
      <Marker position={[actualLat, actualLng]} icon={actualIcon} />

      {/* Player guesses + lines */}
      {validGuesses.map((g, i) => (
        <div key={i}>
          <Marker
            position={[g.guessLat, g.guessLng]}
            icon={createColoredIcon(g.color)}
          />
          <Polyline
            positions={[
              [actualLat, actualLng],
              [g.guessLat, g.guessLng],
            ]}
            pathOptions={{
              color: g.color,
              weight: 2,
              opacity: 0.6,
              dashArray: "6 4",
            }}
          />
        </div>
      ))}
    </MapContainer>
  );
}
