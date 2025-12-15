import { login, signup } from '@/actions/auth'
import { ErrorMessage } from './error-message'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const params = await searchParams

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-900 p-4">
      {/* Background Ambience */}
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/30 blur-[120px]"></div>
      <div className="absolute right-[-10%] bottom-[-10%] h-[500px] w-[500px] rounded-full bg-purple-500/30 blur-[120px]"></div>

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-sm text-gray-400">Sign in to organize your thoughts.</p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="mb-2 block text-xs font-bold tracking-wider text-gray-400 uppercase">
              Email
            </label>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white transition-all outline-none placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold tracking-wider text-gray-400 uppercase">
              Password
            </label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-white transition-all outline-none placeholder:text-gray-600 focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <ErrorMessage error={params.error} />

          <div className="flex gap-4 pt-4">
            <button
              formAction={login}
              className="flex-1 rounded-xl bg-indigo-600 py-3 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all hover:bg-indigo-700"
            >
              Log In
            </button>
            <button
              formAction={signup}
              className="flex-1 rounded-xl border border-white/10 bg-white/10 py-3 font-bold text-white transition-all hover:bg-white/20"
            >
              Sign Up
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
