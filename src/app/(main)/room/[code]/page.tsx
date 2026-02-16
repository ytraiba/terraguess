"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import PanoramaViewer from "@/components/game/PanoramaViewer";
import LoadingTransition from "@/components/game/LoadingTransition";
import RoomLobby from "@/components/multiplayer/RoomLobby";
import PlayerStrip from "@/components/multiplayer/PlayerStrip";
import MultiplayerRoundResult from "@/components/multiplayer/MultiplayerRoundResult";
import FinalStandings from "@/components/multiplayer/FinalStandings";
import { useRoomPoll } from "@/hooks/useRoomPoll";

const GuessMap = dynamic(() => import("@/components/game/GuessMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute bottom-4 right-4 z-[1000] w-[300px] h-[200px] bg-slate-800/50 rounded-xl animate-pulse border border-indigo-500/30" />
  ),
});

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const code = (params.code as string).toUpperCase();
  const userId = session?.user?.id;

  const { roomState, error: pollError, loading } = useRoomPoll(code);

  const [guessPosition, setGuessPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRoundResult, setShowRoundResult] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [localError, setLocalError] = useState("");
  const [hasGuessedThisRound, setHasGuessedThisRound] = useState(false);

  // Track which round we last saw to detect transitions
  const lastRoundRef = useRef(0);
  const roundStartRef = useRef<number | null>(null);

  // Server-synced timer
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Sync timer with server's roundStartedAt
  useEffect(() => {
    if (!roomState || roomState.status !== "playing" || !roomState.roundStartedAt) {
      return;
    }

    const serverStart = new Date(roomState.roundStartedAt).getTime();
    const timeLimit = roomState.timeLimit;

    function tick() {
      const elapsed = (Date.now() - serverStart) / 1000;
      const remaining = Math.max(0, Math.ceil(timeLimit - elapsed));
      setTimerSeconds(remaining);
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [roomState?.roundStartedAt, roomState?.timeLimit, roomState?.status]);

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (
      timerSeconds <= 0 &&
      roomState?.status === "playing" &&
      !hasGuessedThisRound &&
      !isSubmitting &&
      roomState.roundStartedAt
    ) {
      if (guessPosition) {
        handleSubmit();
      } else {
        // No guess placed — submit 0,0 for 0 points
        submitGuess(0, 0, roomState.timeLimit);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerSeconds]);

  // Detect round changes from polling
  useEffect(() => {
    if (!roomState || roomState.status !== "playing") return;

    if (
      roomState.currentRound !== lastRoundRef.current &&
      lastRoundRef.current > 0
    ) {
      // Round changed — show transition if we're not already showing results
      if (!showRoundResult) {
        setShowTransition(true);
      }
      setGuessPosition(null);
      setHasGuessedThisRound(false);
    }

    lastRoundRef.current = roomState.currentRound;
    roundStartRef.current = roomState.roundStartedAt
      ? new Date(roomState.roundStartedAt).getTime()
      : null;
  }, [roomState?.currentRound, roomState?.status]);

  // Detect when all players have guessed → show round result
  useEffect(() => {
    if (roomState?.roundResult && !showRoundResult && hasGuessedThisRound) {
      setShowRoundResult(true);
    }
  }, [roomState?.roundResult, hasGuessedThisRound]);

  // Check if we already guessed (e.g. after page refresh)
  useEffect(() => {
    if (!roomState || !userId) return;
    const me = roomState.players.find((p) => p.userId === userId);
    if (me?.hasGuessedCurrentRound) {
      setHasGuessedThisRound(true);
    }
  }, [roomState?.players, userId, roomState?.currentRound]);

  async function submitGuess(lat: number, lng: number, timeSpent: number) {
    setIsSubmitting(true);
    setLocalError("");

    try {
      const res = await fetch(`/api/rooms/${code}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lng, timeSpent }),
      });
      const data = await res.json();

      if (data.success) {
        setHasGuessedThisRound(true);
      } else {
        if (data.error !== "Already guessed this round") {
          setLocalError(data.error);
        }
        setHasGuessedThisRound(true);
      }
    } catch {
      setLocalError("Failed to submit guess");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit() {
    if (!guessPosition || isSubmitting || hasGuessedThisRound) return;

    const timeSpent = roomState?.roundStartedAt
      ? Math.floor(
          (Date.now() - new Date(roomState.roundStartedAt).getTime()) / 1000
        )
      : 0;

    await submitGuess(guessPosition.lat, guessPosition.lng, timeSpent);
  }

  function handleGuessPlaced(lat: number, lng: number) {
    if (!hasGuessedThisRound) {
      setGuessPosition({ lat, lng });
    }
  }

  async function handleStart() {
    try {
      const res = await fetch(`/api/rooms/${code}/start`, { method: "POST" });
      const data = await res.json();
      if (!data.success) setLocalError(data.error);
    } catch {
      setLocalError("Failed to start game");
    }
  }

  async function handleLeave() {
    try {
      await fetch(`/api/rooms/${code}/leave`, { method: "POST" });
      router.push("/multiplayer");
    } catch {
      router.push("/multiplayer");
    }
  }

  function handleRoundResultContinue() {
    setShowRoundResult(false);
    setGuessPosition(null);
    setHasGuessedThisRound(false);

    // If the round has already advanced (detected via polling), show transition
    if (roomState && roomState.roundResult) {
      setShowTransition(true);
    }
  }

  function handleTransitionComplete() {
    setShowTransition(false);
  }

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (
        (e.code === "Space" || e.code === "Enter") &&
        guessPosition &&
        !showRoundResult &&
        !isSubmitting &&
        !hasGuessedThisRound
      ) {
        e.preventDefault();
        handleSubmit();
      }
      if (
        e.code === "KeyR" &&
        !showRoundResult &&
        !isSubmitting &&
        !hasGuessedThisRound
      ) {
        setGuessPosition(null);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guessPosition, showRoundResult, isSubmitting, hasGuessedThisRound]);

  // Loading state
  if (loading || !roomState) {
    return (
      <div className="flex h-[calc(100vh-57px)] items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <div className="text-lg text-indigo-300 font-medium">
            Connecting to room...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (pollError) {
    return (
      <div className="flex h-[calc(100vh-57px)] items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 backdrop-blur-sm text-center max-w-md">
          <div className="text-lg text-red-400 font-medium mb-4">
            {pollError}
          </div>
          <button
            onClick={() => router.push("/multiplayer")}
            className="px-6 py-2 rounded-lg bg-indigo-500 text-white font-medium hover:bg-indigo-400 transition-colors"
          >
            Back to Multiplayer
          </button>
        </div>
      </div>
    );
  }

  // LOBBY STATE
  if (roomState.status === "waiting") {
    return (
      <RoomLobby
        room={roomState}
        currentUserId={userId || ""}
        onStart={handleStart}
        onLeave={handleLeave}
      />
    );
  }

  // FINISHED STATE
  if (roomState.status === "finished") {
    return (
      <FinalStandings
        room={roomState}
        onPlayAgain={() => router.push("/multiplayer")}
        onBack={() => router.push("/dashboard")}
      />
    );
  }

  // PLAYING STATE
  const currentRound = roomState.round;
  const timerColor =
    timerSeconds <= 10
      ? "text-red-400"
      : timerSeconds <= 30
      ? "text-yellow-400"
      : "text-white";
  const timerBg =
    timerSeconds <= 10
      ? "bg-red-500/20 border-red-500/50"
      : timerSeconds <= 30
      ? "bg-yellow-500/20 border-yellow-500/50"
      : "bg-slate-900/80 border-indigo-500/30";

  return (
    <div className="relative h-[calc(100vh-57px)] bg-slate-900">
      {/* Loading transition between rounds */}
      {showTransition && currentRound && (
        <LoadingTransition
          nextRound={currentRound.roundNumber}
          totalRounds={currentRound.totalRounds}
          onComplete={handleTransitionComplete}
        />
      )}

      {/* Round result overlay */}
      {showRoundResult && roomState.roundResult && (
        <MultiplayerRoundResult
          result={roomState.roundResult}
          roundNumber={roomState.roundResult.roundNumber}
          totalRounds={5}
          onContinue={handleRoundResultContinue}
          isLastRound={roomState.roundResult.roundNumber >= 5}
        />
      )}

      {/* Panorama viewer */}
      {currentRound && !showTransition && !showRoundResult && (
        <PanoramaViewer
          imageId={currentRound.imageId}
          allowMovement={roomState.allowMovement}
          className="absolute inset-0"
        />
      )}

      {/* HUD - only show when playing */}
      {!showTransition && !showRoundResult && (
        <>
          {/* Round + Score - top left */}
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-[1000] rounded-xl bg-slate-900/80 backdrop-blur-md border border-indigo-500/30 px-3 py-2 sm:px-5 sm:py-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
                  Round
                </span>
                <span className="text-xl sm:text-2xl font-bold text-white">
                  {roomState.currentRound}
                  <span className="text-indigo-400/60 text-base sm:text-lg">
                    /5
                  </span>
                </span>
              </div>
              <div className="w-px h-8 sm:h-10 bg-indigo-500/30" />
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-xs text-indigo-300/70 uppercase tracking-wider font-medium">
                  Score
                </span>
                <span className="text-xl sm:text-2xl font-bold text-emerald-400">
                  {(
                    roomState.players.find((p) => p.userId === userId)
                      ?.totalScore ?? 0
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Timer - top center */}
          <div className="absolute top-2 sm:top-4 left-1/2 z-[1000] -translate-x-1/2">
            <div
              className={`rounded-xl px-4 sm:px-6 py-2 sm:py-3 backdrop-blur-md border shadow-lg transition-all ${timerBg}`}
            >
              <div className={`text-2xl sm:text-3xl font-mono font-bold ${timerColor}`}>
                {Math.floor(timerSeconds / 60)}:
                {String(timerSeconds % 60).padStart(2, "0")}
              </div>
            </div>
          </div>

          {/* Player strip - top right */}
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-[1000]">
            <PlayerStrip
              players={roomState.players}
              currentUserId={userId || ""}
            />
          </div>

          {/* Waiting overlay when already guessed */}
          {hasGuessedThisRound && !showRoundResult && (
            <div className="absolute inset-0 z-[999] flex items-center justify-center pointer-events-none">
              <div className="bg-slate-900/70 backdrop-blur-sm rounded-2xl px-8 py-6 text-center border border-indigo-500/30">
                <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
                <p className="text-white font-medium">Guess submitted!</p>
                <p className="text-indigo-300/60 text-sm mt-1">
                  Waiting for other players...
                </p>
              </div>
            </div>
          )}

          {/* Guess map */}
          {!hasGuessedThisRound && (
            <GuessMap
              onGuessPlaced={handleGuessPlaced}
              guessPosition={guessPosition}
              disabled={isSubmitting}
            />
          )}

          {/* Submit button */}
          {guessPosition && !hasGuessedThisRound && (
            <div className="absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="group relative rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-10 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:from-emerald-500 hover:to-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <span className="relative z-10">
                  {isSubmitting ? "Transmitting..." : "Submit Guess"}
                </span>
              </button>
            </div>
          )}

          {/* Mode indicator - bottom left */}
          <div className="hidden sm:block absolute bottom-4 left-4 z-[1000]">
            <div className="rounded-lg bg-slate-900/70 backdrop-blur-sm border border-indigo-500/20 px-3 py-2">
              <span className="text-xs text-indigo-300/70 uppercase tracking-wider">
                {roomState.allowMovement ? "Free Movement" : "No Movement"}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Error toast */}
      {localError && (
        <div className="absolute bottom-20 left-1/2 z-[1100] -translate-x-1/2">
          <div className="bg-red-500/90 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
            {localError}
          </div>
        </div>
      )}
    </div>
  );
}
