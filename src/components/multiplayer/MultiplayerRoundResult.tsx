"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { RoomRoundResult } from "@/lib/game/room-service";

const RoundResultMapMulti = dynamic(() => import("./RoundResultMapMulti"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-white/5 rounded-lg animate-pulse" />
  ),
});

const PLAYER_COLORS = ["#3B82F6", "#EF4444", "#EAB308", "#A855F7"];
const AUTO_ADVANCE_SECONDS = 8;

interface MultiplayerRoundResultProps {
  result: RoomRoundResult;
  roundNumber: number;
  totalRounds: number;
  onContinue: () => void;
  isLastRound: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 4000) return "text-emerald-400";
  if (score >= 2500) return "text-green-400";
  if (score >= 1000) return "text-yellow-400";
  if (score >= 500) return "text-orange-400";
  return "text-red-400";
}

function formatDistance(km: number): string {
  if (km < 0) return "No guess";
  if (km < 1) return `${Math.round(km * 1000)}m`;
  return `${Math.round(km).toLocaleString()} km`;
}

export default function MultiplayerRoundResult({
  result,
  roundNumber,
  totalRounds,
  onContinue,
  isLastRound,
}: MultiplayerRoundResultProps) {
  const [countdown, setCountdown] = useState(AUTO_ADVANCE_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onContinue]);

  // Sort guesses by score descending
  const sorted = [...result.guesses].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900/95 border border-white/10 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        {/* Header */}
        <div className="text-center mb-4">
          <p className="text-indigo-300 text-sm font-medium">
            Round {roundNumber} of {totalRounds}
          </p>
          <h2 className="text-2xl font-bold text-white mt-1">Round Results</h2>
        </div>

        {/* Map */}
        <div className="rounded-xl overflow-hidden mb-4 h-56">
          <RoundResultMapMulti
            actualLat={result.actualLat}
            actualLng={result.actualLng}
            guesses={result.guesses.map((g, i) => ({
              ...g,
              color: PLAYER_COLORS[i % PLAYER_COLORS.length],
            }))}
          />
        </div>

        {/* Scores Table */}
        <div className="space-y-2 mb-6">
          {sorted.map((guess, i) => (
            <div
              key={i}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5"
            >
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs w-5">{i + 1}.</span>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      PLAYER_COLORS[
                        result.guesses.findIndex(
                          (g) => g.playerName === guess.playerName
                        ) % PLAYER_COLORS.length
                      ],
                  }}
                />
                <span className="text-white text-sm font-medium">
                  {guess.playerName}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white/40 text-xs">
                  {formatDistance(guess.distance)}
                </span>
                <span
                  className={`text-sm font-bold ${getScoreColor(guess.score)}`}
                >
                  +{guess.score.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Auto-advance countdown */}
        <button
          onClick={onContinue}
          className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 transition-all"
        >
          {isLastRound ? "View Final Results" : `Next Round in ${countdown}s`}
        </button>
      </div>
    </div>
  );
}
