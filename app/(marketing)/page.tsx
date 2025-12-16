import Link from 'next/link'
import { ArrowRight, Calendar, Clock, BarChart3, Target, Zap } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[#FAFAF9] dark:bg-[#0C0A09] text-stone-900 dark:text-stone-200 selection:bg-orange-500/30 font-sans">

            {/* 1. NAVBAR */}
            <nav className="fixed top-0 w-full z-50 border-b border-stone-200/50 dark:border-white/5 bg-[#FAFAF9]/90 dark:bg-[#0C0A09]/90 backdrop-blur-xl transition-all duration-300">
                <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 font-serif font-bold text-xl tracking-tight text-stone-900 dark:text-stone-100">
                        <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-sm ring-1 ring-orange-400/20">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                        </div>
                        Architect Studio
                    </div>
                    <div className="flex items-center gap-8 text-sm font-medium">
                        <Link href="/login" className="text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white transition-colors">Sign In</Link>
                        <Link href="/dashboard" className="bg-stone-900 dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-sm hover:shadow-md active:scale-95">
                            Enter Studio
                        </Link>
                    </div>
                </div>
            </nav>

            {/* 2. HERO SECTION */}
            <section className="relative pt-40 pb-32 md:pt-56 md:pb-48 px-8 overflow-hidden">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

                <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/50 text-orange-600 dark:text-orange-400 text-xs font-bold uppercase tracking-widest shadow-sm backdrop-blur-sm">
                        <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span></span>
                        v2.0 Now Live
                    </div>

                    <h1 className="text-6xl md:text-8xl font-serif font-bold tracking-tight leading-[1.05] text-stone-900 dark:text-white drop-shadow-sm">
                        Design your time. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600">Architect your life.</span>
                    </h1>

                    <p className="text-2xl md:text-3xl text-stone-500 dark:text-stone-400 max-w-3xl mx-auto leading-relaxed font-light">
                        The operating system for high-performers. Combine strategic planning, deep focus, and AI-powered reflection in one beautiful workspace.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8">
                        <Link href="/dashboard" className="h-14 px-10 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-black font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-xl shadow-stone-900/10 dark:shadow-none text-lg">
                            Start Building
                            <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                {/* Background Elements */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none opacity-30 dark:opacity-20">
                    <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-orange-200/40 rounded-full blur-[120px] mix-blend-multiply filter dark:bg-orange-900/20"></div>
                    <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-amber-100/40 dark:bg-purple-900/20 rounded-full blur-[120px] mix-blend-multiply filter"></div>
                </div>
            </section>

            {/* FEATURE 1: WEEKLY PLANNER */}
            <section className="py-32 px-8 bg-white dark:bg-[#141416] border-y border-stone-100 dark:border-white/5">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">

                        {/* Text Side */}
                        <div className="flex-1 space-y-8">
                            <div className="w-14 h-14 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-stone-900 dark:text-stone-100 shadow-sm">
                                <Calendar className="w-7 h-7" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-stone-900 dark:text-white">
                                The Weekly Strategy
                            </h2>
                            <p className="text-xl text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
                                Stop reacting. Start designing. Drag your strategic goals into reality. Our weekly view is your canvas for a perfect week, ensuring high-level priorities don't get lost in the daily noise.
                            </p>
                            <ul className="space-y-4 text-stone-700 dark:text-stone-300 font-medium">
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 ring-2 ring-orange-100 dark:ring-orange-900/50"></div>
                                    Goal-oriented planning
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 ring-2 ring-orange-100 dark:ring-orange-900/50"></div>
                                    Drag-and-drop scheduling
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-orange-500 ring-2 ring-orange-100 dark:ring-orange-900/50"></div>
                                    Visual workload balancing
                                </li>
                            </ul>
                        </div>

                        {/* Visual Side (Planner Mockup) */}
                        <div className="flex-1 relative group perspective-1000">
                            <div className="absolute -inset-4 bg-gradient-to-r from-orange-100 to-stone-100 dark:from-orange-900/20 dark:to-stone-800/20 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div className="relative bg-stone-50 dark:bg-[#1C1917] border border-stone-200 dark:border-stone-800 rounded-[2.5rem] p-3 shadow-2xl shadow-stone-200/50 dark:shadow-black/50 overflow-hidden transform transition-transform duration-700 group-hover:rotate-y-2 group-hover:scale-[1.02]">
                                <div className="bg-white dark:bg-[#262626] rounded-[2rem] overflow-hidden border border-stone-100 dark:border-stone-800/50">
                                    {/* Fake UI header */}
                                    <div className="h-12 border-b border-stone-100 dark:border-stone-800 flex items-center px-6 gap-4 bg-stone-50/50 dark:bg-stone-900/50">
                                        <div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-stone-200 dark:bg-stone-700"></div><div className="w-3 h-3 rounded-full bg-stone-200 dark:bg-stone-700"></div></div>
                                        <div className="flex-1 text-center text-xs font-bold text-stone-400 uppercase tracking-widest">Weekly Strategy</div>
                                    </div>
                                    {/* Fake Grid */}
                                    <div className="grid grid-cols-5 h-[400px] divide-x divide-stone-100 dark:divide-stone-800">
                                        {[...Array(5)].map((_, i) => (
                                            <div key={i} className="p-4 space-y-3 relative">
                                                <div className="text-center text-xs font-bold text-stone-400 uppercase mb-6">
                                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i]}
                                                </div>
                                                {/* Fake Tasks */}
                                                {i === 0 && <div className="h-16 rounded-xl bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800/50 animate-pulse"></div>}
                                                {i === 1 && <div className="h-24 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 shadow-sm translate-y-4"></div>}
                                                {i === 2 && <div className="h-20 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800"></div>}
                                                {/* Drag Ghost */}
                                                {i === 3 && (
                                                    <div className="absolute top-24 left-4 right-4 h-20 rounded-xl bg-white dark:bg-stone-800 border-2 border-orange-400 dark:border-orange-500 shadow-lg rotate-3 opacity-80 cursor-grabbing">
                                                        <div className="h-full w-full bg-orange-50 dark:bg-orange-900/20 animate-pulse rounded-lg"></div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURE 2: FOCUS MODE */}
            <section className="py-32 px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col-reverse md:flex-row items-center gap-16 md:gap-24">

                        {/* Visual Side (Focus UI Mockup) */}
                        <div className="flex-1 relative group">
                            <div className="absolute -inset-4 bg-gradient-to-l from-stone-100 to-orange-50 dark:from-stone-800/20 dark:to-orange-900/10 rounded-[3rem] blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                            <div className="relative bg-white dark:bg-[#18181b] border border-stone-200 dark:border-stone-800 rounded-[2.5rem] p-8 shadow-2xl shadow-stone-200/50 dark:shadow-none flex flex-col items-center text-center transform transition-transform duration-700 group-hover:scale-[1.02]">
                                <div className="w-24 h-24 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mb-8 relative ring-4 ring-orange-100 dark:ring-orange-900/10">
                                    <div className="absolute inset-0 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
                                    <span className="font-serif text-3xl font-bold text-orange-600 dark:text-orange-400">25:00</span>
                                </div>
                                <h3 className="text-2xl font-serif font-bold mb-2 text-stone-900 dark:text-white">Deep Work Session</h3>
                                <p className="text-stone-500 mb-8">Q4 Launch Strategy Document</p>

                                <div className="w-full max-w-md space-y-3 opacity-50 pointer-events-none grayscale group-hover:grayscale-0 transition-all duration-700">
                                    <div className="h-14 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700 flex items-center px-4 gap-4">
                                        <div className="w-5 h-5 rounded-full border-2 border-stone-300"></div>
                                        <div className="h-2 w-32 bg-stone-200 dark:bg-stone-700 rounded"></div>
                                    </div>
                                    <div className="h-14 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-100 dark:border-stone-700 flex items-center px-4 gap-4">
                                        <div className="w-5 h-5 rounded-full border-2 border-stone-300"></div>
                                        <div className="h-2 w-24 bg-stone-200 dark:bg-stone-700 rounded"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Text Side */}
                        <div className="flex-1 space-y-8 md:pl-12">
                            <div className="w-14 h-14 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-stone-900 dark:text-stone-100 shadow-sm">
                                <Clock className="w-7 h-7" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-stone-900 dark:text-white">
                                Daily Focus Mode
                            </h2>
                            <p className="text-xl text-stone-500 dark:text-stone-400 leading-relaxed max-w-xl">
                                When it's time to execute, Architect eliminates the noise. Our single-task Focus Mode with built-in timers helps you enter a flow state and crush your most important work, one block at a time.
                            </p>
                            <ul className="space-y-4 text-stone-700 dark:text-stone-300 font-medium">
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-stone-900 dark:bg-white"></div>
                                    Distraction-free interface
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-stone-900 dark:bg-white"></div>
                                    Integrated Pomodoro timer
                                </li>
                                <li className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-stone-900 dark:bg-white"></div>
                                    Next-task queuing
                                </li>
                            </ul>
                        </div>

                    </div>
                </div>
            </section>

            {/* FEATURE 3: REFLECTION & AI */}
            <section className="py-32 px-8 bg-[#1C1917] text-white relative overflow-hidden">
                {/* Background Accents */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 right-1/4 w-[800px] h-[800px] bg-orange-500/10 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[8000ms]"></div>
                </div>

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row items-center gap-16 md:gap-24">

                        {/* Text Side */}
                        <div className="flex-1 space-y-8">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-orange-400 backdrop-blur-sm border border-white/5">
                                <Zap className="w-7 h-7" />
                            </div>
                            <h2 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-white">
                                AI-Powered Reflection
                            </h2>
                            <p className="text-xl text-white/70 leading-relaxed max-w-xl font-light">
                                Data without insight is useless. Architect's AI Chief of Staff analyzes your week, identifies your patterns (like being a "morning lark"), and helps you course-correct for the future.
                            </p>
                            <div className="flex gap-4 pt-4">
                                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors cursor-default">
                                    <BarChart3 className="w-4 h-4 text-orange-400" /> Velocity Tracking
                                </div>
                                <div className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium flex items-center gap-2 hover:bg-white/10 transition-colors cursor-default">
                                    <Target className="w-4 h-4 text-orange-400" /> Goal Alignment
                                </div>
                            </div>
                        </div>

                        {/* Visual Side (Reflection Mockup Collection) */}
                        <div className="flex-1 relative">
                            <div className="grid grid-cols-2 gap-4">
                                {/* AI Card */}
                                <div className="col-span-2 bg-gradient-to-br from-stone-800 to-stone-900 border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl group hover:border-orange-500/30 transition-all duration-500">
                                    <div className="absolute top-0 right-0 p-32 bg-orange-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-orange-500/30 transition-all duration-700"></div>
                                    <h3 className="text-lg font-bold font-serif mb-4 flex items-center gap-2 relative z-10 text-white">
                                        <Zap className="w-5 h-5 text-orange-400" />
                                        Chief of Staff Insight
                                    </h3>
                                    <p className="text-white/80 text-lg leading-relaxed relative z-10 font-light">
                                        "You are a <strong className="text-orange-300 font-medium">morning lark</strong>, but you consistently underestimate task complexity on Thursdays. Let's buffer your Thursday morning blocks."
                                    </p>
                                </div>

                                {/* Sankey/Flow Card */}
                                <div className="bg-stone-800/50 border border-white/10 rounded-3xl p-6 h-48 relative overflow-hidden group hover:border-orange-500/50 transition-colors backdrop-blur-md">
                                    <div className="absolute inset-0 opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500">
                                        {/* Fake Sankey SVG */}
                                        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
                                            <path d="M0,20 C50,20 50,40 100,40 L100,60 C50,60 50,80 0,80 Z" fill="url(#grad1)" opacity="0.8" />
                                            <defs>
                                                <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#10b981" />
                                                    <stop offset="100%" stopColor="#3b82f6" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                    </div>
                                    <div className="absolute bottom-6 left-6">
                                        <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">Flow State</div>
                                        <div className="font-serif text-xl font-bold text-white">High Intent</div>
                                    </div>
                                </div>

                                {/* Score Card */}
                                <div className="bg-white text-stone-900 rounded-3xl p-6 h-48 flex flex-col justify-center items-center text-center relative overflow-hidden shadow-lg">
                                    <div className="text-6xl font-black font-serif tracking-tighter text-orange-500 mb-2 relative z-10">
                                        92
                                    </div>
                                    <div className="text-xs font-bold uppercase tracking-widest text-stone-500 relative z-10">Productivity Score</div>
                                    {/* Background flair */}
                                    <div className="absolute bottom-0 left-0 w-full h-2 bg-stone-100">
                                        <div className="h-full bg-orange-500 w-[92%]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* 5. CTA SECTION */}
            <section className="py-40 px-8 text-center relative overflow-hidden bg-white dark:bg-[#0C0A09]">
                {/* Background Grid Accent */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50"></div>

                <div className="max-w-3xl mx-auto relative z-10 space-y-8">
                    <h2 className="text-5xl md:text-7xl font-serif font-bold tracking-tight text-stone-900 dark:text-white">
                        Ready to build?
                    </h2>
                    <p className="text-2xl text-stone-500 dark:text-stone-400 leading-relaxed font-light">
                        Join the high-performers who have stopped reacting and started architecting their lives.
                    </p>
                    <div className="pt-8">
                        <Link href="/dashboard" className="inline-flex h-16 px-12 rounded-2xl bg-orange-500 text-white font-bold items-center gap-3 hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 text-xl transform hover:scale-105">
                            Enter the Studio
                            <ArrowRight className="w-6 h-6" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* 6. FOOTER */}
            <footer className="border-t border-stone-200 dark:border-stone-800 py-16 px-8 bg-[#FAFAF9] dark:bg-[#0C0A09]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 opacity-60">
                    <div className="flex items-center gap-2 font-serif font-bold text-xl text-stone-900 dark:text-white">
                        <div className="w-6 h-6 bg-stone-900 dark:bg-white rounded flex items-center justify-center text-white dark:text-black">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path></svg>
                        </div>
                        Architect Studio.
                    </div>
                    <div className="flex gap-8 text-sm font-medium text-stone-600 dark:text-stone-400">
                        <Link href="#" className="hover:text-stone-900 dark:hover:text-white transition-colors">Manifesto</Link>
                        <Link href="#" className="hover:text-stone-900 dark:hover:text-white transition-colors">Pricing</Link>
                        <Link href="#" className="hover:text-stone-900 dark:hover:text-white transition-colors">Twitter</Link>
                    </div>
                    <div className="text-sm text-stone-500 dark:text-stone-500">© 2025 Architecture Systems Inc.</div>
                </div>
            </footer>
        </div>
    )
}