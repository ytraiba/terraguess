"use client";

import { useState, useCallback, useRef } from "react";
import type { RoundClientData, RoundResult, GameMode } from "@/types/game";
import type { SubmitGuessResponse, CreateGameResponse } from "@/types/api";

interface GameState {
  gameId: string | null;
  mode: GameMode | null;
  currentRound: RoundClientData | null;
  guessPosition: { lat: number; lng: number } | null;
  roundResults: RoundResult[];
  totalScore: number;
  isSubmitting: boolean;
  gameComplete: boolean;
  error: string | null;
}

export function useGame() {
  const [state, setState] = useState<GameState>({
    gameId: null,
    mode: null,
    currentRound: null,
    guessPosition: null,
    roundResults: [],
    totalScore: 0,
    isSubmitting: false,
    gameComplete: false,
    error: null,
  });

  const startTimeRef = useRef<number>(0);

  const createGame = useCallback(async (mode: GameMode) => {
    setState((s) => ({ ...s, error: null }));

    const res = await fetch("/api/game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode }),
    });

    const data = await res.json();
    if (!data.success) {
      setState((s) => ({ ...s, error: data.error }));
      return null;
    }

    const result = data.data as CreateGameResponse;
    startTimeRef.current = Date.now();

    setState({
      gameId: result.gameId,
      mode: result.mode,
      currentRound: result.firstRound,
      guessPosition: null,
      roundResults: [],
      totalScore: 0,
      isSubmitting: false,
      gameComplete: false,
      error: null,
    });

    return result.gameId;
  }, []);

  const placeGuess = useCallback((lat: number, lng: number) => {
    setState((s) => ({ ...s, guessPosition: { lat, lng } }));
  }, []);

  const submitGuess = useCallback(async () => {
    if (!state.gameId || !state.guessPosition) return;

    setState((s) => ({ ...s, isSubmitting: true }));

    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);

    const res = await fetch(`/api/game/${state.gameId}/guess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lat: state.guessPosition.lat,
        lng: state.guessPosition.lng,
        timeSpent,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      setState((s) => ({ ...s, isSubmitting: false, error: data.error }));
      return null;
    }

    const result = data.data as SubmitGuessResponse;
    startTimeRef.current = Date.now();

    setState((s) => ({
      ...s,
      isSubmitting: false,
      currentRound: result.nextRound,
      guessPosition: null,
      roundResults: [...s.roundResults, result.roundResult],
      totalScore: result.totalScore,
      gameComplete: result.gameComplete,
    }));

    return result;
  }, [state.gameId, state.guessPosition]);

  return {
    ...state,
    createGame,
    placeGuess,
    submitGuess,
  };
}
