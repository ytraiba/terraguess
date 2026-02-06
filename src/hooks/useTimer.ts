"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useTimer(initialSeconds: number | null, onExpire?: () => void) {
  const [seconds, setSeconds] = useState(initialSeconds ?? 0);
  const [isRunning, setIsRunning] = useState(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!isRunning || initialSeconds === null) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsRunning(false);
          onExpireRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, initialSeconds]);

  const start = useCallback(() => setIsRunning(true), []);

  const reset = useCallback(
    (newSeconds?: number) => {
      setSeconds(newSeconds ?? initialSeconds ?? 0);
      setIsRunning(false);
    },
    [initialSeconds]
  );

  const elapsed = (initialSeconds ?? 0) - seconds;

  return { seconds, isRunning, start, reset, elapsed };
}
