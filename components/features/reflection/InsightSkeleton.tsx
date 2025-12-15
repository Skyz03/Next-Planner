export default function InsightSkeleton() {
    return (
        <div className="md:col-span-3 bg-stone-100 dark:bg-slate-900/50 rounded-3xl p-8 border border-stone-200 dark:border-slate-800 relative overflow-hidden">
            <div className="flex gap-6 items-start animate-pulse">
                <div className="w-12 h-12 bg-stone-200 dark:bg-slate-800 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                    <div className="h-4 bg-stone-200 dark:bg-slate-800 rounded w-32"></div>
                    <div className="h-4 bg-stone-200 dark:bg-slate-800 rounded w-3/4"></div>
                    <div className="h-4 bg-stone-200 dark:bg-slate-800 rounded w-5/6"></div>
                    <div className="h-4 bg-stone-200 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
            </div>

            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/20 dark:via-white/5 to-transparent"></div>
        </div>
    )
}