"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface RecentGame {
  id: string;
  mode: string;
  totalScore: number;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [games, setGames] = useState<RecentGame[]>([]);
  const [stats, setStats] = useState({ gamesPlayed: 0, avgScore: 0, bestScore: 0 });

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/leaderboard?pageSize=100");
      const data = await res.json();
      if (data.success) {
        const myGames = data.data.entries.filter(
          (e: { userId: string }) => e.userId === session?.user?.id
        );
        if (myGames.length > 0) {
          const scores = myGames.map((g: { totalScore: number }) => g.totalScore);
          setStats({
            gamesPlayed: myGames.length,
            avgScore: Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length),
            bestScore: Math.max(...scores),
          });
          setGames(myGames.slice(0, 5));
        }
      }
    }
    if (session?.user?.id) fetchData();
  }, [session?.user?.id]);

  return (
    <div className="min-h-[calc(100vh-57px)] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl lg:max-w-5xl xl:max-w-6xl">
        {/* Welcome header */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 p-5 sm:p-8 lg:p-10 backdrop-blur-sm">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
            Welcome back,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              {session?.user?.name || "Explorer"}
            </span>
          </h1>
          <p className="mt-2 text-sm sm:text-base text-indigo-200/70">
            Ready to explore the world today?
          </p>

          {/* Quick play */}
          <div className="mt-5 sm:mt-6">
            <Link
              href="/play"
              className="inline-flex items-center gap-2 group relative rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200"
            >
              <span className="relative z-10">Start New Game</span>
              <svg className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
            </Link>
          </div>
        </div>

        {/* Stats - responsive grid */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="rounded-xl bg-slate-800/50 border border-indigo-500/20 p-4 sm:p-6 text-center backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{stats.gamesPlayed}</div>
            <div className="mt-1 text-xs sm:text-sm text-indigo-300/60">Games Played</div>
          </div>
          <div className="rounded-xl bg-slate-800/50 border border-indigo-500/20 p-4 sm:p-6 text-center backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
              {stats.bestScore.toLocaleString()}
            </div>
            <div className="mt-1 text-xs sm:text-sm text-indigo-300/60">Best Score</div>
          </div>
          <div className="rounded-xl bg-slate-800/50 border border-indigo-500/20 p-4 sm:p-6 text-center backdrop-blur-sm">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              {stats.avgScore.toLocaleString()}
            </div>
            <div className="mt-1 text-xs sm:text-sm text-indigo-300/60">Average Score</div>
          </div>
        </div>

        {/* Recent games */}
        {games.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-indigo-400">🎮</span> Recent Games
            </h2>

            {/* Mobile card view */}
            <div className="sm:hidden space-y-3">
              {games.map((game) => (
                <div
                  key={game.id || game.createdAt}
                  className="rounded-xl bg-slate-800/50 border border-indigo-500/20 p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white capitalize">{game.mode}</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {game.totalScore?.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-indigo-300/60">
                    {game.createdAt ? new Date(game.createdAt).toLocaleDateString() : "-"}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden sm:block overflow-hidden rounded-xl bg-slate-800/50 border border-indigo-500/20">
              <table className="w-full">
                <thead className="bg-slate-800/80">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-indigo-300/70 uppercase tracking-wider">
                      Mode
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-indigo-300/70 uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-indigo-300/70 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {games.map((game) => (
                    <tr key={game.id || game.createdAt} className="hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3 text-sm capitalize text-white">
                        {game.mode}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-emerald-400">
                        {game.totalScore?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-indigo-200/60">
                        {game.createdAt
                          ? new Date(game.createdAt).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Empty state */}
        {games.length === 0 && (
          <div className="mt-6 sm:mt-8 rounded-xl bg-slate-800/30 border border-indigo-500/20 p-6 sm:p-8 text-center">
            <div className="text-4xl mb-4">🌍</div>
            <h3 className="text-lg font-medium text-white">No games yet</h3>
            <p className="mt-2 text-sm sm:text-base text-indigo-300/60">
              Start your first game to begin building your history!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
