"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-indigo-500/20 bg-slate-900/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">
            Terra<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Guess</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/play"
            className="text-sm font-medium text-indigo-200/80 hover:text-indigo-300 transition-colors"
          >
            Play
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm font-medium text-indigo-200/80 hover:text-indigo-300 transition-colors"
          >
            Leaderboard
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium text-indigo-200/80 hover:text-indigo-300 transition-colors"
          >
            Profile
          </Link>

          {session?.user && (
            <div className="flex items-center gap-3 pl-4 border-l border-indigo-500/30">
              <span className="text-sm text-indigo-300/70">
                {session.user.name || session.user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-lg bg-slate-800 border border-indigo-500/30 px-3 py-1.5 text-sm font-medium text-indigo-300 hover:bg-slate-700 hover:border-indigo-500/50 transition-all"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
