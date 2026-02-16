"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RoomMode = "classic" | "no-move";

const MODES: { value: RoomMode; label: string; icon: string; desc: string }[] = [
  {
    value: "classic",
    label: "Free Movement",
    icon: "🌍",
    desc: "Explore freely around the panorama",
  },
  {
    value: "no-move",
    label: "No Move",
    icon: "📍",
    desc: "Locked position — use only what you see",
  },
];

export default function MultiplayerPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"create" | "join">("create");
  const [mode, setMode] = useState<RoomMode>("classic");
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to create room");
        return;
      }

      router.push(`/room/${data.data.code}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    const code = joinCode.toUpperCase().trim();
    if (code.length !== 6) {
      setError("Room code must be 6 characters");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/rooms/${code}/join`, { method: "POST" });
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to join room");
        return;
      }

      router.push(`/room/${code}`);
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-57px)] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              Multiplayer
            </span>
          </h1>
          <p className="mt-2 text-sm text-indigo-200/70">
            Challenge your friends — up to 4 players
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-white/5 border border-white/10 p-1 mb-6">
          <button
            onClick={() => { setTab("create"); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === "create"
                ? "bg-indigo-500 text-white shadow-lg"
                : "text-indigo-300/70 hover:text-white"
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => { setTab("join"); setError(""); }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === "join"
                ? "bg-indigo-500 text-white shadow-lg"
                : "text-indigo-300/70 hover:text-white"
            }`}
          >
            Join Room
          </button>
        </div>

        {tab === "create" ? (
          <div>
            {/* Mode Selection */}
            <div className="space-y-3 mb-6">
              {MODES.map((m) => {
                const selected = mode === m.value;
                return (
                  <button
                    key={m.value}
                    onClick={() => setMode(m.value)}
                    className={`w-full rounded-xl border-2 p-4 text-left transition-all duration-200 ${
                      selected
                        ? "border-indigo-500 bg-indigo-500/20 shadow-lg shadow-indigo-500/20"
                        : "border-slate-700 bg-slate-800/50 hover:border-indigo-500/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`text-2xl w-12 h-12 flex items-center justify-center rounded-xl ${
                          selected ? "bg-indigo-500/30" : "bg-slate-700/50"
                        }`}
                      >
                        {m.icon}
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white">
                          {m.label}
                        </h3>
                        <p className="text-xs text-indigo-200/60">{m.desc}</p>
                      </div>
                      {selected && (
                        <div className="ml-auto w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
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

            <div className="text-center text-xs text-indigo-300/40 mb-4">
              90 seconds per round &middot; 5 rounds &middot; up to 4 players
            </div>

            <button
              onClick={handleCreate}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-base font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Creating..." : "Create Room"}
            </button>
          </div>
        ) : (
          <div>
            {/* Join Code Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-indigo-300 mb-2">
                Enter Room Code
              </label>
              <input
                type="text"
                value={joinCode}
                onChange={(e) =>
                  setJoinCode(e.target.value.toUpperCase().slice(0, 6))
                }
                placeholder="ABCDEF"
                maxLength={6}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-center text-2xl font-mono tracking-[0.3em] placeholder:text-white/20 placeholder:tracking-[0.3em] focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && joinCode.length === 6) handleJoin();
                }}
              />
              <p className="text-xs text-indigo-300/40 mt-2 text-center">
                Ask the room host for the 6-character code
              </p>
            </div>

            <button
              onClick={handleJoin}
              disabled={loading || joinCode.length !== 6}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-base font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Joining..." : "Join Room"}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm text-red-400 text-center">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
