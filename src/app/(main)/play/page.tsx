"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GAME_MODE_CONFIG, type GameMode } from "@/types/game";

const modes: GameMode[] = ["classic", "timed", "no-move"];

const modeIcons: Record<GameMode, string> = {
  classic: "🌍",
  timed: "⏱️",
  "no-move": "📍",
};

export default function PlayPage() {
  const router = useRouter();
  const [selectedMode, setSelectedMode] = useState<GameMode>("classic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleStart() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode: selectedMode }),
    });

    const data = await res.json();
    setLoading(false);

    if (!data.success) {
      setError(data.error || "Failed to create game");
      return;
    }

    router.push(`/game/${data.data.gameId}`);
  }

  return (
    <div className="min-h-[calc(100vh-57px)] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl lg:max-w-3xl">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Mission
            </span>
          </h1>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-indigo-200/70">
            Select a game mode and begin your exploration
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {modes.map((mode) => {
            const config = GAME_MODE_CONFIG[mode];
            const isSelected = selectedMode === mode;

            return (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`w-full rounded-xl border-2 p-4 sm:p-6 text-left transition-all duration-200 ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/20"
                    : "border-slate-700 bg-slate-800/50 hover:border-indigo-500/50 hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div
                      className={`text-2xl sm:text-3xl w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-xl flex-shrink-0 ${
                        isSelected
                          ? "bg-indigo-500/30"
                          : "bg-slate-700/50"
                      }`}
                    >
                      {modeIcons[mode]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-white">
                        {config.label}
                      </h3>
                      <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-indigo-200/60">
                        {config.description}
                      </p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-3 h-3 sm:w-4 sm:h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mt-5 sm:mt-6 rounded-xl bg-red-500/10 border border-red-500/30 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={loading}
          className="mt-6 sm:mt-8 w-full group relative rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 sm:py-4 text-base sm:text-lg font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <span className="relative z-10">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Initializing...
              </span>
            ) : (
              "Launch Mission"
            )}
          </span>
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
        </button>

        {/* Multiplayer CTA */}
        <div className="mt-6 sm:mt-8 text-center">
          <div className="inline-flex items-center gap-2 text-indigo-300/50 text-sm mb-3">
            <div className="w-12 h-px bg-indigo-500/20" />
            or
            <div className="w-12 h-px bg-indigo-500/20" />
          </div>
          <div>
            <Link
              href="/multiplayer"
              className="inline-flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-slate-800/50 px-6 py-3 text-sm font-medium text-indigo-300 hover:bg-slate-800 hover:border-indigo-500/50 transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Challenge Friends — Multiplayer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
