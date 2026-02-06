"use client";

import { useState } from "react";
import type { GameResult } from "@/types/game";

interface ShareResultsProps {
  result: GameResult;
  gameId: string;
}

function generateScoreEmojis(score: number, maxScore: number): string {
  const percentage = score / maxScore;
  const blocks = 5;
  const filled = Math.round(percentage * blocks);
  return "🟩".repeat(filled) + "⬜".repeat(blocks - filled);
}

function generateShareText(result: GameResult): string {
  const percentage = Math.round(
    (result.totalScore / result.maxPossibleScore) * 100
  );

  const roundEmojis = result.rounds
    .map((r) => {
      const roundPercent = r.score / 5000;
      if (roundPercent >= 0.9) return "🎯";
      if (roundPercent >= 0.7) return "🔥";
      if (roundPercent >= 0.5) return "✨";
      if (roundPercent >= 0.3) return "📍";
      return "🌍";
    })
    .join("");

  return `🌍 TerraGuess

${generateScoreEmojis(result.totalScore, result.maxPossibleScore)} ${percentage}%

Score: ${result.totalScore.toLocaleString()}/${result.maxPossibleScore.toLocaleString()}
Mode: ${result.mode.charAt(0).toUpperCase() + result.mode.slice(1)}
Rounds: ${roundEmojis}

Play at terraguess.app`;
}

export default function ShareResults({ result, gameId }: ShareResultsProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareText = generateShareText(result);

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "TerraGuess Results",
          text: shareText,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="inline-flex items-center gap-2 rounded-xl border-2 border-indigo-500/50 px-6 py-4 text-lg font-bold text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400/50 transition-all duration-200"
    >
      {copied ? (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}
