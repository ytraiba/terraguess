"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import PanoramaViewer from "@/components/game/PanoramaViewer";
import LoadingTransition from "@/components/game/LoadingTransition";
import { useTimer } from "@/hooks/useTimer";
import type { RoundClientData, RoundResult, GameMode } from "@/types/game";
import { GAME_MODE_CONFIG } from "@/types/game";

const GuessMap = dynamic(() => import("@/components/game/GuessMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute bottom-4 right-4 z-[1000] w-[300px] h-[200px] bg-slate-800/50 rounded-xl animate-pulse border border-indigo-500/30" />
  ),
});

const RoundResultMap = dynamic(
  () => import("@/components/game/RoundResultMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-800 animate-pulse rounded-xl" />
    ),
  }
);

interface GamePageState {
  currentRound: RoundClientData | null;
  guessPosition: { lat: number; lng: number } | null;
  roundResults: RoundResult[];
  totalScore: number;
  isSubmitting: boolean;
  gameComplete: boolean;
  showRoundResult: RoundResult | null;
  showLoadingTransition: boolean;
  nextRoundData: RoundClientData | null;
  mode: GameMode | null;
  error: string | null;
  loading: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 4000) return "text-emerald-400";
  if (score >= 2500) return "text-green-400";
  if (score >= 1000) return "text-yellow-400";
  if (score >= 500) return "text-orange-400";
  return "text-red-400";
}

function getScoreMessage(score: number): string {
  if (score >= 4500) return "Perfect!";
  if (score >= 4000) return "Excellent!";
  if (score >= 2500) return "Great guess!";
  if (score >= 1000) return "Not bad!";
  if (score >= 500) return "Could be closer";
  return "Way off!";
}

export default function GamePage() {
  const params = useParams();
  const router = useRouter();
  const gameId = params.gameId as string;

  const [state, setState] = useState<GamePageState>({
    currentRound: null,
    guessPosition: null,
    roundResults: [],
    totalScore: 0,
    isSubmitting: false,
    gameComplete: false,
    showRoundResult: null,
    showLoadingTransition: false,
    nextRoundData: null,
    mode: null,
    error: null,
    loading: true,
  });

  const timeLimit = state.currentRound?.timeLimit ?? null;

  const handleTimerExpire = useCallback(() => {
    if (state.guessPosition) {
      handleSubmit();
    } else {
      const randomLat = Math.random() * 180 - 90;
      const randomLng = Math.random() * 360 - 180;
      setState((s) => ({
        ...s,
        guessPosition: { lat: randomLat, lng: randomLng },
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.guessPosition]);

  const { seconds, start, reset } = useTimer(timeLimit, handleTimerExpire);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Space or Enter to submit guess
      if ((e.code === "Space" || e.code === "Enter") && state.guessPosition && !state.showRoundResult && !state.isSubmitting) {
        e.preventDefault();
        handleSubmit();
      }
      // R to reset guess position
      if (e.code === "KeyR" && !state.showRoundResult && !state.isSubmitting) {
        setState((s) => ({ ...s, guessPosition: null }));
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.guessPosition, state.showRoundResult, state.isSubmitting]);

  useEffect(() => {
    async function fetchRound() {
      const res = await fetch(`/api/game/${gameId}`);
      const data = await res.json();
      if (data.success) {
        setState((s) => ({
          ...s,
          currentRound: data.data,
          mode: data.data.timeLimit ? "timed" : null,
          loading: false,
        }));
        if (data.data.timeLimit) {
          reset(data.data.timeLimit);
          start();
        }
      } else {
        setState((s) => ({ ...s, error: data.error, loading: false }));
      }
    }
    fetchRound();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  function handleGuessPlaced(lat: number, lng: number) {
    setState((s) => ({ ...s, guessPosition: { lat, lng } }));
  }

  async function handleSubmit() {
    if (!state.guessPosition || state.isSubmitting) return;

    setState((s) => ({ ...s, isSubmitting: true }));

    const res = await fetch(`/api/game/${gameId}/guess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: state.guessPosition.lat,
        lng: state.guessPosition.lng,
        timeSpent: timeLimit ? timeLimit - seconds : 0,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      setState((s) => ({ ...s, isSubmitting: false, error: data.error }));
      return;
    }

    const result = data.data;

    setState((s) => ({
      ...s,
      isSubmitting: false,
      showRoundResult: result.roundResult,
      roundResults: [...s.roundResults, result.roundResult],
      totalScore: result.totalScore,
      gameComplete: result.gameComplete,
      nextRoundData: result.nextRound || null,
    }));
  }

  function handleContinue() {
    if (state.gameComplete) {
      router.push(`/results/${gameId}`);
    } else {
      // Show loading transition, then load next round
      setState((s) => ({
        ...s,
        showRoundResult: null,
        showLoadingTransition: true,
      }));
    }
  }

  function handleTransitionComplete() {
    setState((s) => ({
      ...s,
      showLoadingTransition: false,
      currentRound: s.nextRoundData,
      nextRoundData: null,
      guessPosition: null,
    }));
    if (state.nextRoundData?.timeLimit) {
      reset(state.nextRoundData.timeLimit);
      start();
    }
  }

  if (state.loading) {
    return (
      <div className="flex h-[calc(100vh-57px)] items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <div className="text-lg text-indigo-300 font-medium">
            Initializing TerraGuess...
          </div>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className="flex h-[calc(100vh-57px)] items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm">
          <div className="text-lg text-red-400 font-medium">{state.error}</div>
        </div>
      </div>
    );
  }

  const modeConfig = state.mode
    ? GAME_MODE_CONFIG[state.mode]
    : GAME_MODE_CONFIG.classic;

  return (
    <div className="relative h-[calc(100vh-57px)] bg-slate-900">
      {/* Loading transition between rounds */}
      {state.showLoadingTransition && state.nextRoundData && (
        <LoadingTransition
          nextRound={state.nextRoundData.roundNumber}
          totalRounds={state.nextRoundData.totalRounds}
          onComplete={handleTransitionComplete}
        />
      )}

      {/* Panorama viewer */}
      {state.currentRound && !state.showLoadingTransition && (
        <PanoramaViewer
          imageId={state.currentRound.imageId}
          allowMovement={modeConfig.allowMovement}
          className="absolute inset-0"
        />
      )}

      {/* Round info overlay - top left */}
      {!state.showLoadingTransition && (
        <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-[1000] rounded-xl bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 px-3 py-2 sm:px-5 sm:py-3 shadow-lg shadow-indigo-500/10">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
                Round
              </span>
              <span className="text-xl sm:text-2xl font-bold text-white">
                {state.currentRound?.roundNumber || 0}
                <span className="text-indigo-400/60 text-base sm:text-lg">
                  /{state.currentRound?.totalRounds || 5}
                </span>
              </span>
            </div>
            <div className="w-px h-8 sm:h-10 bg-indigo-500/30" />
            <div className="flex flex-col">
              <span className="text-[10px] sm:text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
                Score
              </span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-400">
                {state.totalScore.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Timer (timed mode) - top center */}
      {timeLimit && !state.showLoadingTransition && (
        <div className="absolute top-4 left-1/2 z-[1000] -translate-x-1/2">
          <div
            className={`rounded-xl px-6 py-3 backdrop-blur-md border shadow-lg transition-all ${
              seconds <= 10
                ? "bg-red-500/20 border-red-500/50 shadow-red-500/20"
                : seconds <= 30
                ? "bg-yellow-500/20 border-yellow-500/50 shadow-yellow-500/20"
                : "bg-slate-900/80 border-indigo-500/30 shadow-indigo-500/10"
            }`}
          >
            <div
              className={`text-3xl font-mono font-bold ${
                seconds <= 10
                  ? "text-red-400"
                  : seconds <= 30
                  ? "text-yellow-400"
                  : "text-white"
              }`}
            >
              {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
            </div>
          </div>
        </div>
      )}

      {/* Keyboard hints - top right (hidden on mobile) */}
      {!state.showRoundResult && !state.showLoadingTransition && (
        <div className="hidden md:block absolute top-4 right-4 z-[1000]">
          <div className="rounded-lg bg-slate-900/70 backdrop-blur-sm border border-indigo-500/20 px-3 py-2">
            <div className="flex gap-3 text-xs text-indigo-300/50">
              <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-indigo-300">Space</kbd> Submit</span>
              <span><kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-indigo-300">R</kbd> Reset</span>
            </div>
          </div>
        </div>
      )}

      {/* Round result overlay with map */}
      {state.showRoundResult && !state.showLoadingTransition && (
        <div className="absolute inset-0 z-[1001] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-2 sm:p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-indigo-500/30 shadow-2xl shadow-indigo-500/20 overflow-hidden max-h-[95vh] flex flex-col">
            {/* Score header */}
            <div className="p-4 sm:p-6 text-center border-b border-indigo-500/20 bg-slate-800/50">
              <div className="text-xs sm:text-sm text-indigo-300/70 uppercase tracking-wider mb-1">
                {getScoreMessage(state.showRoundResult.score)}
              </div>
              <div
                className={`text-4xl sm:text-5xl font-bold ${getScoreColor(
                  state.showRoundResult.score
                )}`}
              >
                +{state.showRoundResult.score.toLocaleString()}
              </div>
              <div className="mt-1 sm:mt-2 text-sm sm:text-base text-indigo-200/80">
                {state.showRoundResult.distance < 1
                  ? `${Math.round(state.showRoundResult.distance * 1000)} meters away`
                  : `${Math.round(state.showRoundResult.distance).toLocaleString()} km away`}
              </div>
            </div>

            {/* Map showing guess vs actual */}
            <div className="h-[200px] sm:h-[300px] relative flex-shrink-0">
              <RoundResultMap
                guessLat={state.showRoundResult.guessLat}
                guessLng={state.showRoundResult.guessLng}
                actualLat={state.showRoundResult.actualLat}
                actualLng={state.showRoundResult.actualLng}
              />
              {/* Legend */}
              <div className="absolute bottom-2 sm:bottom-3 left-2 sm:left-3 z-[1000] flex gap-2 sm:gap-3 bg-slate-900/80 backdrop-blur-sm rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-700">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500 border-2 border-white" />
                  <span className="text-[10px] sm:text-xs text-slate-300">You</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500 border-2 border-white" />
                  <span className="text-[10px] sm:text-xs text-slate-300">Actual</span>
                </div>
              </div>
            </div>

            {/* Continue button */}
            <div className="p-3 sm:p-4 text-center bg-slate-800/30 border-t border-indigo-500/20">
              <button
                onClick={handleContinue}
                className="group relative rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 sm:px-10 py-3 text-base sm:text-lg font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200"
              >
                <span className="relative z-10">
                  {state.gameComplete ? "View Results" : "Next Round"}
                </span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
              </button>
              <div className="hidden sm:block mt-2 text-xs text-indigo-300/50">
                Press <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Space</kbd> or <kbd className="px-1.5 py-0.5 bg-slate-800 rounded">Enter</kbd>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guess map */}
      {!state.showRoundResult && !state.showLoadingTransition && (
        <GuessMap
          onGuessPlaced={handleGuessPlaced}
          guessPosition={state.guessPosition}
          disabled={state.isSubmitting}
        />
      )}

      {/* Submit button */}
      {state.guessPosition && !state.showRoundResult && !state.showLoadingTransition && (
        <div className="absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2">
          <button
            onClick={handleSubmit}
            disabled={state.isSubmitting}
            className="group relative rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:from-emerald-500 hover:to-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            <span className="relative z-10">
              {state.isSubmitting ? "Transmitting..." : "Submit Guess"}
            </span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-400 to-green-400 opacity-0 group-hover:opacity-20 transition-opacity" />
          </button>
        </div>
      )}

      {/* Mode indicator - bottom left (hidden on mobile) */}
      {!state.showRoundResult && !state.showLoadingTransition && (
        <div className="hidden sm:block absolute bottom-4 left-4 z-[1000]">
          <div className="rounded-lg bg-slate-900/70 backdrop-blur-sm border border-indigo-500/20 px-3 py-2">
            <span className="text-xs text-indigo-300/70 uppercase tracking-wider">
              {modeConfig.allowMovement ? "Free Movement" : "No Movement"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
