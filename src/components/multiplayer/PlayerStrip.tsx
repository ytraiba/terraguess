"use client";

import type { RoomPollPlayer } from "@/lib/game/room-service";

const PLAYER_COLORS = [
  "bg-blue-500",
  "bg-red-500",
  "bg-yellow-500",
  "bg-purple-500",
];

interface PlayerStripProps {
  players: RoomPollPlayer[];
  currentUserId: string;
}

export default function PlayerStrip({ players, currentUserId }: PlayerStripProps) {
  // Sort: current user first, then by join order
  const sorted = [...players].sort((a, b) => {
    if (a.userId === currentUserId) return -1;
    if (b.userId === currentUserId) return 1;
    return 0;
  });

  return (
    <div className="flex gap-2 flex-wrap">
      {sorted.map((player, i) => {
        const colorIndex = players.findIndex((p) => p.id === player.id);
        return (
          <div
            key={player.id}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border ${
              player.userId === currentUserId
                ? "border-indigo-500/50"
                : "border-white/10"
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${PLAYER_COLORS[colorIndex % PLAYER_COLORS.length]}`}
            />
            <span className="text-white text-xs font-medium max-w-[80px] truncate">
              {player.userId === currentUserId ? "You" : player.name}
            </span>
            <span className="text-white/50 text-xs">
              {player.totalScore.toLocaleString()}
            </span>
            {player.hasGuessedCurrentRound ? (
              <svg
                className="w-3.5 h-3.5 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5 text-amber-400 animate-pulse"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            )}
          </div>
        );
      })}
    </div>
  );
}
