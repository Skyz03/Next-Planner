import { login, signup } from '@/actions/auth'
import { FormMessage } from './form-message' // Import the new component
import Link from 'next/link'
import { Suspense } from 'react' // Needed because FormMessage uses useSearchParams

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FAFAF9] p-4 dark:bg-[#0C0A09]">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]"></div>
      <div className="absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-stone-500/10 blur-[120px]"></div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-stone-300/50 bg-white/70 p-8 shadow-2xl backdrop-blur-md dark:border-stone-700/50 dark:bg-stone-900/90">

        {/* Branding */}
        <Link href="/" className="mb-6 flex items-center justify-center gap-2 font-serif font-bold text-xl tracking-tight text-stone-900 dark:text-white">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-md">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
          </div>
          Architect Studio
        </Link>

        <div className="mb-8 text-center pt-4">
          <h1 className="mb-2 text-3xl font-serif font-bold text-stone-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Sign in to the Studio.
          </p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-bold tracking-wider text-stone-500 uppercase dark:text-stone-400">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-900 transition-all outline-none placeholder:text-stone-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:placeholder:text-stone-600 dark:focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold tracking-wider text-stone-500 uppercase dark:text-stone-400">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-900 transition-all outline-none placeholder:text-stone-400 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:placeholder:text-stone-600 dark:focus:border-orange-500"
              required
            />
          </div>

          {/* 🔔 Message Area - Wrapped in Suspense */}
          <Suspense fallback={null}>
            <FormMessage />
          </Suspense>

          <div className="flex gap-4 pt-4">
            <button
              formAction={login}
              className="flex-1 rounded-xl bg-orange-500 py-3 font-bold text-white shadow-lg shadow-orange-500/30 transition-all hover:bg-orange-600 active:scale-95"
            >
              Log In
            </button>
            <button
              formAction={signup}
              className="flex-1 rounded-xl border border-stone-300 bg-white py-3 font-bold text-stone-700 transition-all hover:bg-stone-100 active:scale-95 dark:border-stone-700 dark:bg-stone-800 dark:text-white dark:hover:bg-stone-700"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}