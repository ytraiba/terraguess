import Link from "next/link";
import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md space-y-6 rounded-2xl bg-slate-800/50 backdrop-blur-md border border-indigo-500/30 p-8 shadow-xl shadow-indigo-500/10 relative z-10">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-white">
              Terra<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Guess</span>
            </h1>
          </Link>
          <p className="mt-2 text-sm text-indigo-200/70">
            Join the exploration
          </p>
        </div>
        <RegisterForm />
        <p className="text-center text-sm text-indigo-200/60">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
