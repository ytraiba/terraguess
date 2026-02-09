"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface UserStats {
  highScore: number;
  totalGames: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedAt: string | null;
  memberSince: string;
  averageScore: number;
  completedGames: number;
  recentGames: Array<{
    id: string;
    mode: string;
    totalScore: number;
    completedAt: string;
  }>;
  bestByMode: Record<string, { highScore: number; gamesPlayed: number }>;
}

function StatCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: string | number;
  icon: string;
  gradient: string;
}) {
  return (
    <div className="rounded-xl bg-slate-800/50 border border-indigo-500/20 p-3 sm:p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`text-xl sm:text-2xl ${gradient}`}>{icon}</div>
        <div>
          <div className="text-[10px] sm:text-xs text-indigo-300/60 uppercase tracking-wider">
            {label}
          </div>
          <div
            className={`text-lg sm:text-2xl lg:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}
          >
            {value}
          </div>
        </div>
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score >= 20000) return "text-emerald-400";
  if (score >= 15000) return "text-green-400";
  if (score >= 10000) return "text-yellow-400";
  return "text-orange-400";
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const res = await fetch("/api/user/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
      setLoading(false);
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-57px)] items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <div className="text-lg text-indigo-300 font-medium">
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-[calc(100vh-57px)] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-4xl lg:max-w-5xl xl:max-w-6xl">
        {/* Profile Header */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-indigo-500/30 p-5 sm:p-6 lg:p-8 shadow-xl shadow-indigo-500/10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl sm:text-3xl lg:text-4xl font-bold text-white shadow-lg shadow-indigo-500/30">
              {session?.user?.name?.[0]?.toUpperCase() ||
                session?.user?.email?.[0]?.toUpperCase() ||
                "?"}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                {session?.user?.name || "Explorer"}
              </h1>
              <p className="mt-1 text-sm text-indigo-300/70 truncate max-w-full">
                {session?.user?.email}
              </p>
              <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs sm:text-sm text-indigo-300">
                  <span>🗓️</span>
                  Since {formatDate(stats?.memberSince || null)}
                </span>
                {stats && stats.currentStreak > 0 && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-xs sm:text-sm text-orange-300">
                    <span>🔥</span>
                    {stats.currentStreak} day streak
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mt-6 sm:mt-8">
          <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
            <span className="text-indigo-400">📊</span> Your Stats
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              label="High Score"
              value={stats?.highScore?.toLocaleString() || 0}
              icon="🏆"
              gradient="from-yellow-400 to-amber-400"
            />
            <StatCard
              label="Games Played"
              value={stats?.totalGames || 0}
              icon="🎮"
              gradient="from-indigo-400 to-purple-400"
            />
            <StatCard
              label="Current Streak"
              value={stats?.currentStreak || 0}
              icon="🔥"
              gradient="from-orange-400 to-red-400"
            />
            <StatCard
              label="Longest Streak"
              value={stats?.longestStreak || 0}
              icon="⚡"
              gradient="from-cyan-400 to-blue-400"
            />
          </div>
        </div>

        {/* Additional Stats */}
        <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="rounded-xl bg-slate-800/50 border border-indigo-500/20 p-4 sm:p-5">
            <div className="text-xs sm:text-sm text-indigo-300/60 uppercase tracking-wider mb-2">
              Average Score
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
              {stats?.averageScore?.toLocaleString() || 0}
              <span className="text-base sm:text-lg text-indigo-400/60">/25,000</span>
            </div>
            <div className="mt-2 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 transition-all"
                style={{
                  width: `${Math.min(100, ((stats?.averageScore || 0) / 25000) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="rounded-xl bg-slate-800/50 border border-indigo-500/20 p-4 sm:p-5">
            <div className="text-xs sm:text-sm text-indigo-300/60 uppercase tracking-wider mb-2">
              Last Played
            </div>
            <div className="text-lg sm:text-xl font-medium text-white">
              {formatDate(stats?.lastPlayedAt || null)}
            </div>
            {stats?.lastPlayedAt && (
              <div className="mt-2 text-xs sm:text-sm text-indigo-300/50">
                Keep the streak alive!
              </div>
            )}
          </div>
        </div>

        {/* Best by Mode */}
        {stats?.bestByMode && Object.keys(stats.bestByMode).length > 0 && (
          <div className="mt-6 sm:mt-8">
            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-indigo-400">🎯</span> Best by Mode
            </h2>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {["classic", "timed", "no-move"].map((mode) => {
                const modeStats = stats.bestByMode[mode];
                const modeLabels: Record<string, { name: string; icon: string }> = {
                  classic: { name: "Classic", icon: "🌍" },
                  timed: { name: "Timed", icon: "⏱️" },
                  "no-move": { name: "No Move", icon: "📍" },
                };
                const { name, icon } = modeLabels[mode] || { name: mode, icon: "🎮" };

                return (
                  <div
                    key={mode}
                    className="rounded-xl bg-slate-800/50 border border-indigo-500/20 p-3 sm:p-4"
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
                      <span className="text-base sm:text-lg">{icon}</span>
                      <span className="text-xs sm:text-sm font-medium text-indigo-300 truncate">
                        {name}
                      </span>
                    </div>
                    {modeStats ? (
                      <>
                        <div className="text-lg sm:text-2xl font-bold text-white">
                          {modeStats.highScore.toLocaleString()}
                        </div>
                        <div className="text-[10px] sm:text-xs text-indigo-300/50">
                          {modeStats.gamesPlayed} games
                        </div>
                      </>
                    ) : (
                      <div className="text-indigo-300/50 text-xs sm:text-sm">
                        Not played
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Games */}
        {stats?.recentGames && stats.recentGames.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <h2 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-indigo-400">🕐</span> Recent Games
            </h2>

            {/* Mobile card view */}
            <div className="sm:hidden space-y-3">
              {stats.recentGames.map((game) => (
                <div
                  key={game.id}
                  className="rounded-xl bg-slate-800/50 border border-indigo-500/20 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium text-white capitalize">
                        {game.mode}
                      </span>
                      <div className="text-xs text-indigo-300/50 mt-0.5">
                        {formatDate(game.completedAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-lg font-bold ${getScoreColor(game.totalScore)}`}>
                        {game.totalScore.toLocaleString()}
                      </span>
                      <Link
                        href={`/results/${game.id}`}
                        className="text-sm text-indigo-400 hover:text-indigo-300"
                      >
                        View
                      </Link>
                    </div>
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
                    <th className="px-4 py-3 text-right text-xs font-medium text-indigo-300/70 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {stats.recentGames.map((game) => (
                    <tr
                      key={game.id}
                      className="hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm text-white capitalize">
                        {game.mode}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-medium ${getScoreColor(game.totalScore)}`}>
                          {game.totalScore.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-indigo-200/60">
                        {formatDate(game.completedAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/results/${game.id}`}
                          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CTA if no games */}
        {(!stats?.recentGames || stats.recentGames.length === 0) && (
          <div className="mt-6 sm:mt-8 text-center py-10 sm:py-12 rounded-xl bg-slate-800/30 border border-indigo-500/20">
            <div className="text-4xl sm:text-5xl mb-4">🌍</div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
              No games yet!
            </h3>
            <p className="text-sm sm:text-base text-indigo-300/60 mb-6">
              Start exploring the world and build your stats.
            </p>
            <Link
              href="/play"
              className="inline-flex group relative rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 sm:px-8 py-3 text-base sm:text-lg font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200"
            >
              <span className="relative z-10">Play Now</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
