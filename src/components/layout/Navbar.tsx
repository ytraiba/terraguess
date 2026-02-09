"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/play", label: "Play" },
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/profile", label: "Profile" },
  ];

  return (
    <nav className="border-b border-indigo-500/20 bg-slate-900/95 backdrop-blur-md sticky top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-white">
            Terra<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Guess</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-indigo-200/80 hover:text-indigo-300 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {session?.user && (
            <div className="flex items-center gap-3 pl-4 border-l border-indigo-500/30">
              <span className="text-sm text-indigo-300/70 max-w-[120px] truncate">
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

        {/* Mobile hamburger button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden p-2 rounded-lg bg-slate-800/50 border border-indigo-500/30 text-indigo-300"
          aria-label="Toggle menu"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Drawer */}
          <div className="md:hidden fixed top-[57px] right-0 w-64 h-[calc(100vh-57px)] bg-slate-900 border-l border-indigo-500/20 z-50 animate-in slide-in-from-right duration-200">
            <div className="flex flex-col p-4 gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-lg px-4 py-3 text-base font-medium text-indigo-200 hover:bg-slate-800 hover:text-indigo-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {session?.user && (
                <div className="mt-4 pt-4 border-t border-indigo-500/20">
                  <div className="px-4 py-2 text-sm text-indigo-300/70 truncate">
                    {session.user.name || session.user.email}
                  </div>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="w-full mt-2 rounded-lg bg-slate-800 border border-indigo-500/30 px-4 py-3 text-base font-medium text-indigo-300 hover:bg-slate-700 hover:border-indigo-500/50 transition-all text-left"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
