"use client";

import { MapContainer, TileLayer, Marker, Polyline, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { RoundResult } from "@/types/game";

function scoreToColor(score: number): string {
  if (score >= 4500) return "#22c55e"; // green
  if (score >= 3000) return "#a3e635"; // lime
  if (score >= 1500) return "#fbbf24"; // amber
  return "#ef4444"; // red
}

function createGuessIcon() {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background:#ef4444;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(239,68,68,0.5),0 2px 6px rgba(0,0,0,0.4)"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function createActualIcon(color: string, label: string) {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background:${color};width:28px;height:28px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:12px;box-shadow:0 0 10px ${color}80,0 2px 6px rgba(0,0,0,0.4)">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

interface ResultsMapProps {
  rounds: RoundResult[];
}

export default function ResultsMap({ rounds }: ResultsMapProps) {
  // Fit all points
  const allPoints = rounds.flatMap((r) => [
    [r.actualLat, r.actualLng] as [number, number],
    [r.guessLat, r.guessLng] as [number, number],
  ]);

  const bounds = L.latLngBounds(allPoints);

  return (
    <MapContainer
      bounds={bounds}
      boundsOptions={{ padding: [30, 30] }}
      style={{ width: "100%", height: "100%" }}
      zoomControl={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {rounds.map((round) => {
        const color = scoreToColor(round.score);
        return (
          <div key={round.roundNumber}>
            {/* Actual location marker */}
            <Marker
              position={[round.actualLat, round.actualLng]}
              icon={createActualIcon(color, String(round.roundNumber))}
            >
              <Popup className="custom-popup">
                <div className="font-semibold">Round {round.roundNumber}</div>
                <div className="text-sm text-gray-600">Actual Location</div>
                <div className="mt-1 font-bold text-green-600">+{round.score} pts</div>
              </Popup>
            </Marker>

            {/* Guess marker */}
            <Marker
              position={[round.guessLat, round.guessLng]}
              icon={createGuessIcon()}
            >
              <Popup className="custom-popup">
                <div className="font-semibold">Round {round.roundNumber}</div>
                <div className="text-sm text-gray-600">Your Guess</div>
                <div className="mt-1 text-sm">
                  {round.distance < 1
                    ? `${Math.round(round.distance * 1000)} m away`
                    : `${Math.round(round.distance).toLocaleString()} km away`}
                </div>
              </Popup>
            </Marker>

            {/* Line connecting guess to actual */}
            <Polyline
              positions={[
                [round.actualLat, round.actualLng],
                [round.guessLat, round.guessLng],
              ]}
              color={color}
              weight={2}
              dashArray="6,6"
              opacity={0.8}
            />
          </div>
        );
      })}
    </MapContainer>
  );
}
