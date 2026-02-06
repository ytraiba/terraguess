"use client";

import { useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom marker icon matching space theme
const guessIcon = L.divIcon({
  className: "custom-marker",
  html: `<div style="background:linear-gradient(135deg, #f97316, #ef4444);width:24px;height:24px;border-radius:50%;border:3px solid white;box-shadow:0 0 12px rgba(249,115,22,0.6),0 2px 8px rgba(0,0,0,0.4)"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface GuessMapProps {
  onGuessPlaced: (lat: number, lng: number) => void;
  guessPosition: { lat: number; lng: number } | null;
  disabled: boolean;
}

function ClickHandler({
  onGuessPlaced,
  disabled,
}: {
  onGuessPlaced: (lat: number, lng: number) => void;
  disabled: boolean;
}) {
  useMapEvents({
    click(e) {
      if (!disabled) {
        onGuessPlaced(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
}

export default function GuessMap({
  onGuessPlaced,
  guessPosition,
  disabled,
}: GuessMapProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGuess = useCallback(
    (lat: number, lng: number) => {
      onGuessPlaced(lat, lng);
    },
    [onGuessPlaced]
  );

  const toggleExpand = () => setIsExpanded(!isExpanded);

  return (
    <>
      {/* Mobile: Collapsed state - just a button */}
      <button
        onClick={toggleExpand}
        className={`md:hidden fixed bottom-20 right-4 z-[1000] rounded-xl bg-slate-900/90 backdrop-blur-md border-2 border-indigo-500/50 px-4 py-3 shadow-lg shadow-indigo-500/20 transition-all ${
          isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-sm font-medium text-indigo-300">
            {guessPosition ? "Adjust Guess" : "Open Map"}
          </span>
          {guessPosition && (
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          )}
        </div>
      </button>

      {/* Mobile fullscreen / Desktop floating */}
      <div
        className={`fixed md:absolute z-[1000] transition-all duration-300 ease-out rounded-xl overflow-hidden border-2 shadow-xl ${
          isExpanded
            ? "inset-4 md:bottom-4 md:right-4 md:left-auto md:top-auto md:w-[500px] md:h-[400px] border-indigo-500/50 shadow-indigo-500/30"
            : "bottom-4 right-4 w-[300px] h-[200px] border-indigo-500/30 shadow-indigo-500/20 hidden md:block"
        }`}
        onMouseEnter={() => !("ontouchstart" in window) && setIsExpanded(true)}
        onMouseLeave={() => !("ontouchstart" in window) && !guessPosition && setIsExpanded(false)}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 pointer-events-none z-10" />

        <MapContainer
          center={[20, 0]}
          zoom={1}
          style={{ width: "100%", height: "100%" }}
          zoomControl={false}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <ClickHandler onGuessPlaced={handleGuess} disabled={disabled} />
          {guessPosition && (
            <Marker
              position={[guessPosition.lat, guessPosition.lng]}
              icon={guessIcon}
            />
          )}
        </MapContainer>

        {/* Instruction overlay when no guess placed */}
        {!guessPosition && (
          <div className="absolute bottom-2 left-2 right-2 z-20 pointer-events-none">
            <div className="bg-slate-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-indigo-500/30">
              <p className="text-xs text-indigo-300/80 text-center">
                Tap to place your guess
              </p>
            </div>
          </div>
        )}

        {/* Close button (mobile expanded) */}
        {isExpanded && (
          <button
            onClick={toggleExpand}
            className="md:hidden absolute top-3 right-3 z-20 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-indigo-500/30 p-2"
          >
            <svg className="w-5 h-5 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Expand indicator (desktop only) */}
        {!isExpanded && (
          <div className="hidden md:block absolute top-2 right-2 z-20 pointer-events-none">
            <div className="bg-slate-900/60 rounded px-2 py-1">
              <span className="text-[10px] text-indigo-300/60">Hover to expand</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
