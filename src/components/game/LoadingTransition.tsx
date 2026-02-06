"use client";

import { useEffect, useState } from "react";

interface LoadingTransitionProps {
  nextRound: number;
  totalRounds: number;
  onComplete?: () => void;
}

export default function LoadingTransition({
  nextRound,
  totalRounds,
  onComplete,
}: LoadingTransitionProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100 && onComplete) {
      const timer = setTimeout(onComplete, 200);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  return (
    <div className="absolute inset-0 z-[1002] flex items-center justify-center bg-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Moving stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              top: Math.random() * 100 + "%",
              left: Math.random() * 100 + "%",
              opacity: Math.random() * 0.5 + 0.2,
              animationDelay: Math.random() * 2 + "s",
              animationDuration: Math.random() * 2 + 1 + "s",
            }}
          />
        ))}

        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "0.5s" }} />
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated globe SVG */}
        <div className="relative w-48 h-48 mb-8">
          <svg
            viewBox="0 0 200 200"
            className="w-full h-full"
          >
            {/* Globe background */}
            <defs>
              <linearGradient id="globeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
              <clipPath id="globeClip">
                <circle cx="100" cy="100" r="80" />
              </clipPath>
            </defs>

            {/* Outer glow */}
            <circle
              cx="100"
              cy="100"
              r="85"
              fill="none"
              stroke="url(#globeGradient)"
              strokeWidth="2"
              opacity="0.5"
              className="animate-pulse"
            />

            {/* Globe */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="url(#globeGradient)"
              opacity="0.2"
            />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="url(#globeGradient)"
              strokeWidth="3"
            />

            {/* Animated latitude lines */}
            <g clipPath="url(#globeClip)">
              {[-60, -30, 0, 30, 60].map((lat, i) => (
                <ellipse
                  key={lat}
                  cx="100"
                  cy={100 + lat}
                  rx={80 * Math.cos((lat * Math.PI) / 180)}
                  ry="8"
                  fill="none"
                  stroke="#a5b4fc"
                  strokeWidth="1"
                  opacity="0.4"
                  className="animate-pulse"
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}

              {/* Animated longitude lines */}
              <g
                style={{
                  transform: `rotate(${progress * 3.6}deg)`,
                  transformOrigin: "100px 100px",
                }}
              >
                {[0, 30, 60, 90, 120, 150].map((lng) => (
                  <ellipse
                    key={lng}
                    cx="100"
                    cy="100"
                    rx={Math.sin((lng * Math.PI) / 180) * 80}
                    ry="80"
                    fill="none"
                    stroke="#a5b4fc"
                    strokeWidth="1"
                    opacity="0.4"
                  />
                ))}
              </g>

              {/* Location pin */}
              <g
                style={{
                  transform: `translate(${Math.sin((progress * 3.6 * Math.PI) / 180) * 30}px, ${Math.cos((progress * 3.6 * Math.PI) / 180) * 20}px)`,
                }}
              >
                <circle cx="120" cy="80" r="8" fill="#22c55e" className="animate-pulse" />
                <circle cx="120" cy="80" r="12" fill="none" stroke="#22c55e" strokeWidth="2" opacity="0.5" className="animate-ping" />
              </g>
            </g>
          </svg>

          {/* Orbiting particle */}
          <div
            className="absolute w-3 h-3 bg-indigo-400 rounded-full shadow-lg shadow-indigo-400/50"
            style={{
              top: "50%",
              left: "50%",
              transform: `rotate(${progress * 7.2}deg) translateX(100px) translateY(-50%)`,
              transformOrigin: "0 0",
            }}
          />
        </div>

        {/* Round indicator */}
        <div className="text-center mb-6">
          <div className="text-sm text-indigo-300/70 uppercase tracking-wider mb-2">
            Teleporting to
          </div>
          <div className="text-4xl font-bold text-white">
            Round {nextRound}
            <span className="text-indigo-400/60 text-2xl">/{totalRounds}</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-100 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Loading text */}
        <div className="mt-4 text-indigo-300/60 text-sm">
          Scanning coordinates...
        </div>
      </div>
    </div>
  );
}
