import Link from 'next/link'
import { ArrowRight, Check, Layout, Target, Zap } from 'lucide-react' // Ensure lucide-react is installed

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#0C0A09] text-stone-900 dark:text-stone-200 selection:bg-orange-500/30">

            {/* 1. NAVBAR */}
            <nav className="fixed top-0 w-full z-50 border-b border-stone-200/50 dark:border-white/5 bg-[#FAFAF9]/80 dark:bg-[#0C0A09]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-serif font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                        </div>
                        Architect
                    </div>
                    <div className="flex items-center gap-6 text-sm font-medium">
                        <Link href="/login" className="text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors">Sign In</Link>
                        <Link href="/dashboard" className="bg-stone-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                            Enter Studio
                        </Link>
                    </div>
                </div>
            </nav>

            {/* 2. HERO SECTION */}
            <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 px-6 overflow-hidden">
                <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest">
                        <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span></span>
                        v2.0 Now Live
                    </div>

                    <h1 className="text-5xl md:text-7xl font-serif font-bold tracking-tight leading-[1.1]">
                        Design your time. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-600">Architect your life.</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-stone-500 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
                        The operating system for high-performers. Combine strategic planning, deep focus, and AI-powered reflection in one beautiful workspace.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Link href="/dashboard" className="h-12 px-8 rounded-xl bg-stone-900 dark:bg-white text-white dark:text-black font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                            Start Building
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <button className="h-12 px-8 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 font-bold text-stone-600 dark:text-stone-300 transition-colors">
                            View Manifesto
                        </button>
                    </div>
                </div>

                {/* Abstract Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-40 dark:opacity-20">
                    <div className="absolute top-20 left-10 w-64 h-64 bg-orange-200 rounded-full blur-3xl mix-blend-multiply filter"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full blur-3xl mix-blend-multiply filter"></div>
                </div>
            </section>

            {/* 3. APP PREVIEW (BENTO GRID) */}
            <section className="px-6 pb-32">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">

                    {/* Main Dashboard Preview */}
                    <div className="md:col-span-8 bg-white dark:bg-[#18181b] rounded-3xl border border-stone-200 dark:border-stone-800 p-2 shadow-2xl shadow-stone-200/50 dark:shadow-none overflow-hidden group">
                        <div className="bg-stone-100 dark:bg-[#202022] rounded-2xl h-[400px] w-full relative overflow-hidden">
                            <div className="absolute top-8 left-8 right-0 bottom-0 bg-white dark:bg-[#0C0A09] rounded-tl-2xl border-l border-t border-stone-200 dark:border-stone-800 shadow-xl p-8 transition-transform duration-500 group-hover:-translate-x-2 group-hover:-translate-y-2">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="space-y-2">
                                        <div className="h-2 w-24 bg-stone-200 dark:bg-stone-800 rounded"></div>
                                        <div className="h-8 w-48 bg-stone-900 dark:bg-stone-100 rounded"></div>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-orange-500"></div>
                                </div>
                                <div className="space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-16 w-full border border-stone-100 dark:border-stone-800 rounded-xl flex items-center px-4 gap-4">
                                            <div className="h-5 w-5 rounded border-2 border-stone-200 dark:border-stone-700"></div>
                                            <div className="h-3 w-32 bg-stone-100 dark:bg-stone-800 rounded"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-8">
                            <h3 className="text-xl font-bold font-serif mb-2">Tactical Command Center</h3>
                            <p className="text-stone-500">Drag-and-drop planning. Time-blocking. Real-time focus metrics. Everything you need to win the day.</p>
                        </div>
                    </div>

                    {/* Reflection Preview */}
                    <div className="md:col-span-4 space-y-6">
                        <div className="bg-stone-900 dark:bg-stone-100 text-white dark:text-black rounded-3xl p-8 h-full flex flex-col justify-between relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="w-12 h-12 bg-white/10 dark:bg-black/10 rounded-xl flex items-center justify-center mb-4">
                                    <Zap className="w-6 h-6" />
                                </div>
                                <h3 className="text-xl font-bold font-serif mb-2">AI Chief of Staff</h3>
                                <p className="text-white/60 dark:text-black/60 text-sm leading-relaxed">
                                    "You are a morning lark, but you consistently underestimate task complexity on Thursdays."
                                </p>
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-50"></div>
                        </div>

                        <div className="bg-white dark:bg-[#18181b] rounded-3xl border border-stone-200 dark:border-stone-800 p-8">
                            <h3 className="text-lg font-bold font-serif mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-orange-500" />
                                Strategic Alignment
                            </h3>
                            <div className="space-y-3">
                                {['Q4 Launch', 'Fitness Protocol', 'Deep Learning'].map((tag) => (
                                    <div key={tag} className="flex items-center justify-between text-sm">
                                        <span className="text-stone-600 dark:text-stone-300">{tag}</span>
                                        <div className="w-24 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-500 w-[70%] rounded-full"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. FOOTER */}
            <footer className="border-t border-stone-200 dark:border-stone-800 py-12 px-6 bg-white dark:bg-[#0C0A09]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 opacity-60">
                    <div className="font-serif font-bold">Architect.</div>
                    <div className="text-sm">© 2025 Architecture Systems Inc.</div>
                </div>
            </footer>
        </div>
    )
}