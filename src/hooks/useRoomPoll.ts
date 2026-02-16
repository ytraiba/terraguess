"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { RoomPollResponse } from "@/lib/game/room-service";

const POLL_INTERVAL = 2000;
const MAX_RETRIES = 3;

export function useRoomPoll(code: string | null) {
  const [roomState, setRoomState] = useState<RoomPollResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const retriesRef = useRef(0);
  const activeRef = useRef(true);

  const fetchState = useCallback(async () => {
    if (!code || !activeRef.current) return;

    try {
      const res = await fetch(`/api/rooms/${code}/poll`);
      const data = await res.json();

      if (!activeRef.current) return;

      if (data.success) {
        setRoomState(data.data);
        setError(null);
        retriesRef.current = 0;
      } else {
        setError(data.error);
      }
    } catch {
      retriesRef.current++;
      if (retriesRef.current >= MAX_RETRIES) {
        setError("Connection lost. Please refresh the page.");
      }
    } finally {
      if (activeRef.current) setLoading(false);
    }
  }, [code]);

  useEffect(() => {
    activeRef.current = true;
    setLoading(true);

    // Initial fetch
    fetchState();

    // Poll at interval
    const interval = setInterval(fetchState, POLL_INTERVAL);

    return () => {
      activeRef.current = false;
      clearInterval(interval);
    };
  }, [fetchState]);

  // Stop polling when game is finished
  useEffect(() => {
    if (roomState?.status === "finished") {
      activeRef.current = false;
    }
  }, [roomState?.status]);

  const refresh = useCallback(() => {
    retriesRef.current = 0;
    setError(null);
    fetchState();
  }, [fetchState]);

  return { roomState, error, loading, refresh };
}
