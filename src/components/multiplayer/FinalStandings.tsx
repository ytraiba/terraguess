"use client";

import type { RoomPollResponse } from "@/lib/game/room-service";

interface FinalStandingsProps {
  room: RoomPollResponse;
  onPlayAgain: () => void;
  onBack: () => void;
}

const MEDAL_EMOJIS = ["🥇", "🥈", "🥉"];
const PODIUM_COLORS = [
  "from-amber-500/20 to-yellow-500/20 border-amber-500/30",
  "from-gray-400/20 to-slate-400/20 border-gray-400/30",
  "from-orange-600/20 to-amber-700/20 border-orange-600/30",
];

function getScoreGradient(rank: number): string {
  if (rank === 0) return "from-amber-400 to-yellow-300";
  if (rank === 1) return "from-gray-300 to-slate-200";
  if (rank === 2) return "from-orange-400 to-amber-300";
  return "from-indigo-400 to-purple-400";
}

export default function FinalStandings({
  room,
  onPlayAgain,
  onBack,
}: FinalStandingsProps) {
  const ranked = [...room.players].sort((a, b) => b.totalScore - a.totalScore);
  const maxScore = 5 * 5000; // 25,000

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Game Over!</h1>
          <p className="text-indigo-300/70 text-sm">
            {room.mode === "classic" ? "Free Movement" : "No Move"} &middot;{" "}
            {room.timeLimit}s rounds
          </p>
        </div>

        {/* Winner Highlight */}
        {ranked[0] && (
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-lg font-bold text-white">{ranked[0].name}</p>
            <p
              className={`text-2xl font-extrabold bg-gradient-to-r ${getScoreGradient(0)} bg-clip-text text-transparent`}
            >
              {ranked[0].totalScore.toLocaleString()} pts
            </p>
          </div>
        )}

        {/* Rankings */}
        <div className="space-y-2 mb-6">
          {ranked.map((player, i) => (
            <div
              key={player.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                i < 3
                  ? `bg-gradient-to-r ${PODIUM_COLORS[i]}`
                  : "bg-white/5 border-white/10"
              }`}
            >
              <span className="text-xl w-8 text-center">
                {i < 3 ? MEDAL_EMOJIS[i] : `#${i + 1}`}
              </span>

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

              <span className="text-white font-medium flex-1 truncate">
                {player.name}
              </span>

              <div className="text-right">
                <span
                  className={`font-bold bg-gradient-to-r ${getScoreGradient(i)} bg-clip-text text-transparent`}
                >
                  {player.totalScore.toLocaleString()}
                </span>
                <div className="w-24 h-1.5 bg-white/10 rounded-full mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                    style={{
                      width: `${(player.totalScore / maxScore) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Round-by-round breakdown */}
        {room.allRoundResults && room.allRoundResults.length > 0 && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 mb-6">
            <h3 className="text-sm font-medium text-indigo-300 mb-3">
              Round Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-white/40 border-b border-white/10">
                    <th className="text-left py-1.5 pr-2">Player</th>
                    {room.allRoundResults.map((r) => (
                      <th key={r.roundNumber} className="text-center py-1.5 px-1">
                        R{r.roundNumber}
                      </th>
                    ))}
                    <th className="text-right py-1.5 pl-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {ranked.map((player) => (
                    <tr
                      key={player.id}
                      className="border-b border-white/5 last:border-0"
                    >
                      <td className="text-white py-1.5 pr-2 font-medium truncate max-w-[80px]">
                        {player.name}
                      </td>
                      {room.allRoundResults!.map((round) => {
                        const guess = round.guesses.find(
                          (g) => g.playerName === player.name
                        );
                        return (
                          <td
                            key={round.roundNumber}
                            className="text-center py-1.5 px-1 text-white/60"
                          >
                            {guess ? guess.score.toLocaleString() : "0"}
                          </td>
                        );
                      })}
                      <td className="text-right py-1.5 pl-2 font-bold text-white">
                        {player.totalScore.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={onPlayAgain}
            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 transition-all shadow-lg shadow-indigo-500/25"
          >
            Play Again
          </button>
          <button
            onClick={onBack}
            className="w-full py-2.5 rounded-xl text-sm font-medium text-indigo-300 hover:text-indigo-200 hover:bg-white/5 transition-colors border border-white/10"
          >
            Back to Menu
          </button>
        </div>
      </div>
    </div>
  );
}
