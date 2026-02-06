"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import type { GameResult } from "@/types/game";
import ShareResults from "@/components/results/ShareResults";

const ResultsMap = dynamic(() => import("@/components/results/ResultsMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full animate-pulse rounded-xl bg-slate-800/50 border border-indigo-500/20" />
  ),
});

function getScoreColor(score: number, max: number): string {
  const percentage = score / max;
  if (percentage >= 0.8) return "from-emerald-400 to-green-400";
  if (percentage >= 0.6) return "from-green-400 to-lime-400";
  if (percentage >= 0.4) return "from-yellow-400 to-amber-400";
  if (percentage >= 0.2) return "from-orange-400 to-red-400";
  return "from-red-400 to-rose-400";
}

function getScoreMessage(percentage: number): string {
  if (percentage >= 90) return "Outstanding Explorer!";
  if (percentage >= 75) return "World Traveler!";
  if (percentage >= 50) return "Global Navigator";
  if (percentage >= 25) return "Learning the Ropes";
  return "Keep Exploring";
}

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const [result, setResult] = useState<GameResult | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchResults() {
      const res = await fetch(`/api/game/${gameId}/complete`);
      const data = await res.json();
      setLoading(false);
      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error);
      }
    }
    fetchResults();
  }, [gameId]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-57px)] items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <div className="text-lg text-indigo-300 font-medium">
            Loading results...
          </div>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="flex h-[calc(100vh-57px)] items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-lg text-red-400 font-medium">
            {error || "No results found"}
          </div>
        </div>
      </div>
    );
  }

  const percentage = Math.round(
    (result.totalScore / result.maxPossibleScore) * 100
  );

  return (
    <div className="min-h-[calc(100vh-57px)] bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Summary Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-indigo-500/30 p-8 text-center shadow-xl shadow-indigo-500/10">
          <div className="text-sm text-indigo-300/70 uppercase tracking-wider">
            {getScoreMessage(percentage)}
          </div>
          <h1 className="mt-2 text-3xl font-bold text-white">Mission Complete</h1>

          <div
            className={`mt-6 text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${getScoreColor(
              result.totalScore,
              result.maxPossibleScore
            )}`}
          >
            {result.totalScore.toLocaleString()}
          </div>

          <div className="mt-2 text-indigo-200/60">
            out of {result.maxPossibleScore.toLocaleString()} points ({percentage}%)
          </div>

          {/* Progress bar */}
          <div className="mt-4 mx-auto max-w-sm">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getScoreColor(
                  result.totalScore,
                  result.maxPossibleScore
                )} transition-all duration-1000`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 border border-indigo-500/20">
            <span className="text-sm text-indigo-300/70">Mode:</span>
            <span className="text-sm font-medium text-indigo-200 capitalize">
              {result.mode}
            </span>
          </div>
        </div>

        {/* Map */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
            <span className="text-indigo-400">📍</span> Your Journey
          </h2>
          <div className="h-[400px] overflow-hidden rounded-xl border border-indigo-500/30">
            <ResultsMap rounds={result.rounds} />
          </div>
          {/* Legend */}
          <div className="mt-3 flex justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500 border-2 border-white" />
              <span className="text-sm text-indigo-300/70">Your guesses</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-white" />
              <span className="text-sm text-indigo-300/70">Actual locations</span>
            </div>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold text-white flex items-center gap-2">
            <span className="text-indigo-400">📊</span> Round Breakdown
          </h2>
          <div className="overflow-hidden rounded-xl bg-slate-800/50 border border-indigo-500/20">
            <table className="w-full">
              <thead className="bg-slate-800/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-indigo-300/70 uppercase tracking-wider">
                    Round
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-indigo-300/70 uppercase tracking-wider">
                    Distance
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-indigo-300/70 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-indigo-300/70 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {result.rounds.map((round) => (
                  <tr key={round.roundNumber} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-white font-medium">
                      #{round.roundNumber}
                    </td>
                    <td className="px-4 py-3 text-sm text-indigo-200/80">
                      {round.distance < 1
                        ? `${Math.round(round.distance * 1000)} m`
                        : `${Math.round(round.distance).toLocaleString()} km`}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-medium ${
                          round.score >= 4000
                            ? "text-emerald-400"
                            : round.score >= 2500
                            ? "text-green-400"
                            : round.score >= 1000
                            ? "text-yellow-400"
                            : "text-orange-400"
                        }`}
                      >
                        +{round.score.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-indigo-200/60">
                      {round.timeSpent}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            onClick={() => router.push("/play")}
            className="group relative rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200"
          >
            <span className="relative z-10">Play Again</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>
          <ShareResults result={result} gameId={gameId} />
          <button
            onClick={() => router.push("/leaderboard")}
            className="rounded-xl border-2 border-indigo-500/50 px-10 py-4 text-lg font-bold text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400/50 transition-all duration-200"
          >
            Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
}
