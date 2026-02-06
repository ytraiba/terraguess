"use client";

import { useEffect, useState } from "react";
import type { LeaderboardEntry } from "@/types/api";

const modeFilters: { label: string; value: string }[] = [
  { label: "All Modes", value: "all" },
  { label: "Classic", value: "classic" },
  { label: "Timed", value: "timed" },
  { label: "No Move", value: "no-move" },
];

function getRankBadge(rank: number): string {
  if (rank === 1) return "🥇";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return `#${rank}`;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [mode, setMode] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      setLoading(true);
      const res = await fetch(`/api/leaderboard?mode=${mode}&pageSize=50`);
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setEntries(data.data.entries);
      }
    }
    fetchLeaderboard();
  }, [mode]);

  return (
    <div className="min-h-[calc(100vh-57px)] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold text-white text-center">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
            Global
          </span>{" "}
          Leaderboard
        </h1>
        <p className="mt-2 text-center text-indigo-200/70">
          Top explorers from around the world
        </p>

        {/* Filters */}
        <div className="mt-8 flex justify-center gap-2 flex-wrap">
          {modeFilters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setMode(filter.value)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-200 ${
                mode === filter.value
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30"
                  : "bg-slate-800/50 text-indigo-300/80 border border-indigo-500/30 hover:bg-slate-700/50 hover:border-indigo-500/50"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <div className="text-indigo-300/70">Loading rankings...</div>
          </div>
        ) : entries.length === 0 ? (
          <div className="mt-12 rounded-xl bg-slate-800/30 border border-indigo-500/20 p-8 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-lg font-medium text-white">No rankings yet</h3>
            <p className="mt-2 text-indigo-300/60">
              Be the first to complete a game and claim the top spot!
            </p>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-xl bg-slate-800/50 border border-indigo-500/20">
            <table className="w-full">
              <thead className="bg-slate-800/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-indigo-300/70 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-indigo-300/70 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-indigo-300/70 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-indigo-300/70 uppercase tracking-wider">
                    Mode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-indigo-300/70 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {entries.map((entry) => (
                  <tr
                    key={`${entry.userId}-${entry.completedAt}`}
                    className={`hover:bg-slate-700/30 transition-colors ${
                      entry.rank <= 3 ? "bg-indigo-500/5" : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-bold text-white">
                      {getRankBadge(entry.rank)}
                    </td>
                    <td className="px-4 py-3 text-sm text-white font-medium">
                      {entry.userName}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-bold ${
                          entry.rank === 1
                            ? "text-yellow-400"
                            : entry.rank <= 3
                            ? "text-emerald-400"
                            : "text-indigo-300"
                        }`}
                      >
                        {entry.totalScore.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize text-indigo-200/70">
                      {entry.mode}
                    </td>
                    <td className="px-4 py-3 text-sm text-indigo-200/60">
                      {new Date(entry.completedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
