"use client";

import { useState } from "react";
import type { RoomPollResponse } from "@/lib/game/room-service";

interface RoomLobbyProps {
  room: RoomPollResponse;
  currentUserId: string;
  onStart: () => void;
  onLeave: () => void;
}

export default function RoomLobby({
  room,
  currentUserId,
  onStart,
  onLeave,
}: RoomLobbyProps) {
  const [copied, setCopied] = useState(false);
  const isHost = room.hostId === currentUserId;
  const canStart = isHost && room.players.length >= 2;

  const copyCode = async () => {
    await navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Room Code */}
        <div className="text-center mb-8">
          <p className="text-indigo-300 text-sm font-medium mb-2 uppercase tracking-wider">
            Room Code
          </p>
          <button
            onClick={copyCode}
            className="group relative inline-flex items-center gap-3"
          >
            <span className="text-5xl font-mono font-bold tracking-[0.3em] text-white">
              {room.code}
            </span>
            <span className="text-indigo-400 group-hover:text-indigo-300 transition-colors">
              {copied ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </span>
          </button>
          <p className="text-indigo-400/60 text-xs mt-2">
            {copied ? "Copied!" : "Click to copy"}
          </p>
        </div>

        {/* Mode Badge */}
        <div className="flex justify-center mb-6">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {room.mode === "classic" ? "Free Movement" : "No Move"} &middot; {room.timeLimit}s per round
          </span>
        </div>

        {/* Players */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-indigo-300">
              Players ({room.players.length}/{room.maxPlayers ?? 4})
            </h3>
            <div className="flex gap-1">
              {Array.from({ length: room.maxPlayers ?? 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full ${
                    i < room.players.length ? "bg-emerald-400" : "bg-white/10"
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {room.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5"
              >
                {player.image ? (
                  <img
                    src={player.image}
                    alt=""
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-indigo-500/30 flex items-center justify-center text-indigo-300 text-sm font-medium">
                    {player.name[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <span className="text-white text-sm font-medium flex-1">
                  {player.name}
                </span>
                {player.userId === room.hostId && (
                  <span className="text-xs text-amber-400 font-medium">Host</span>
                )}
              </div>
            ))}

            {/* Empty slots */}
            {Array.from({
              length: (room.maxPlayers ?? 4) - room.players.length,
            }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center gap-3 px-3 py-2 rounded-lg border border-dashed border-white/10"
              >
                <div className="w-8 h-8 rounded-full bg-white/5" />
                <span className="text-white/30 text-sm">Waiting for player...</span>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {isHost ? (
            <button
              onClick={onStart}
              disabled={!canStart}
              className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 shadow-lg shadow-indigo-500/25"
            >
              {room.players.length < 2
                ? "Need at least 2 players"
                : "Start Game"}
            </button>
          ) : (
            <div className="text-center py-3 text-indigo-300/70 text-sm">
              Waiting for host to start the game...
            </div>
          )}

          <button
            onClick={onLeave}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors border border-red-500/20"
          >
            Leave Room
          </button>
        </div>
      </div>
    </div>
  );
}
