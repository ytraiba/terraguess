import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 relative overflow-hidden">
      {/* Starfield effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full opacity-60" />
        <div className="absolute top-1/3 left-1/2 w-0.5 h-0.5 bg-white rounded-full opacity-40" />
        <div className="absolute top-1/2 left-1/3 w-1 h-1 bg-indigo-300 rounded-full opacity-50" />
        <div className="absolute top-2/3 left-2/3 w-0.5 h-0.5 bg-white rounded-full opacity-30" />
        <div className="absolute top-1/5 right-1/4 w-1 h-1 bg-purple-300 rounded-full opacity-40" />
        <div className="absolute bottom-1/4 right-1/3 w-0.5 h-0.5 bg-white rounded-full opacity-50" />
        <div className="absolute top-3/4 left-1/5 w-1 h-1 bg-white rounded-full opacity-30" />
        <div className="absolute bottom-1/3 left-3/4 w-0.5 h-0.5 bg-indigo-200 rounded-full opacity-40" />
      </div>

      {/* Glow orbs */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

      <div className="text-center relative z-10">
        <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-500/30">
          <span className="text-sm text-indigo-300 font-medium">🌍 Explore the world</span>
        </div>

        <h1 className="text-6xl font-bold text-white">
          Terra<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Guess</span>
        </h1>

        <p className="mt-4 text-xl text-indigo-200/90 max-w-md mx-auto">
          Test your geography knowledge by exploring street-level imagery from around the globe
        </p>

        <p className="mt-2 text-indigo-300/60 max-w-sm mx-auto">
          Guess locations from street-level imagery. The closer you are, the higher your score.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <Link
            href="/login"
            className="group relative rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-200"
          >
            <span className="relative z-10">Sign In</span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity" />
          </Link>
          <Link
            href="/register"
            className="rounded-xl border-2 border-indigo-500/50 px-8 py-4 text-lg font-bold text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-400/50 transition-all duration-200"
          >
            Register
          </Link>
        </div>

        <div className="mt-16 grid max-w-lg mx-auto grid-cols-3 gap-8">
          <div className="rounded-xl bg-slate-800/50 border border-indigo-500/20 p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">5</div>
            <div className="mt-1 text-sm text-indigo-300/60">Rounds per game</div>
          </div>
          <div className="rounded-xl bg-slate-800/50 border border-indigo-500/20 p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">25K</div>
            <div className="mt-1 text-sm text-indigo-300/60">Max points</div>
          </div>
          <div className="rounded-xl bg-slate-800/50 border border-indigo-500/20 p-4 backdrop-blur-sm">
            <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">3</div>
            <div className="mt-1 text-sm text-indigo-300/60">Game modes</div>
          </div>
        </div>
      </div>
    </div>
  );
}
