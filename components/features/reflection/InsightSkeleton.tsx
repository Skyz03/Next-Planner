export default function InsightSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-stone-200 bg-stone-100 p-8 md:col-span-3 dark:border-slate-800 dark:bg-slate-900/50">
      <div className="flex animate-pulse items-start gap-6">
        <div className="h-12 w-12 rounded-xl bg-stone-200 dark:bg-slate-800"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 w-32 rounded bg-stone-200 dark:bg-slate-800"></div>
          <div className="h-4 w-3/4 rounded bg-stone-200 dark:bg-slate-800"></div>
          <div className="h-4 w-5/6 rounded bg-stone-200 dark:bg-slate-800"></div>
          <div className="h-4 w-1/2 rounded bg-stone-200 dark:bg-slate-800"></div>
        </div>
      </div>

      {/* Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5"></div>
    </div>
  )
}
