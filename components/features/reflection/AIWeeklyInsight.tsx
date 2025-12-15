import { generateWeeklyInsight } from '../../../app/reflection/actions'

export default async function AIWeeklyInsight({ data }: { data: any }) {
    // This line pauses this specific component until AI responds
    // while the rest of the page remains interactive
    const insightHtml = await generateWeeklyInsight(data)

    return (
        <div className="md:col-span-2 bg-gradient-to-r from-stone-900 to-[#2c2927] dark:from-[#1e1b4b] dark:to-[#0f172a] rounded-[2rem] p-8 text-stone-200 shadow-2xl relative overflow-hidden group border border-stone-800/50">

            {/* Animated Gradient Border/Glow */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>

            {/* Background Decor */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl group-hover:bg-indigo-500/30 transition-all duration-1000"></div>

            <div className="relative z-10 flex gap-6 items-start">
                {/* AI Icon */}
                <div className="flex-none p-3 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-indigo-300">
                        <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                        <path d="M12 2a10 10 0 0 1 10 10" />
                        <path d="M2.05 10.95A10 10 0 0 1 12 2" />
                        <path d="M12 12l4.95-4.95" />
                    </svg>
                </div>

                <div className="flex-1">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-3 flex items-center gap-2">
                        AI Chief of Staff
                        <span className="inline-flex w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    </h3>

                    {/* Render the AI HTML content */}
                    <div
                        className="prose prose-invert prose-sm max-w-none text-stone-300 [&>strong]:text-white [&>strong]:font-serif"
                        dangerouslySetInnerHTML={{ __html: insightHtml }}
                    />
                </div>
            </div>
        </div>
    )
}