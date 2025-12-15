'use client'

import { useState, useEffect } from 'react'
import InboxCapture from '../features/inbox/InboxCapture'

export default function DashboardShell({
    sidebar,
    children,
    viewMode
}: {
    sidebar: React.ReactNode,
    children: React.ReactNode,
    viewMode: string
}) {
    // Default to closed in Focus mode, open in Plan mode
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    // Auto-open sidebar when switching to Plan mode
    useEffect(() => {
        if (viewMode === 'plan') {
            setIsSidebarOpen(true)
        } else {
            setIsSidebarOpen(false)
        }
    }, [viewMode])

    return (
        <div className="flex h-screen bg-[#FAFAF9] dark:bg-[#1C1917] overflow-hidden">
            <InboxCapture />
            {/* 1. SIDEBAR CONTAINER (The "Snap" Logic) */}
            <div
                className={`flex-none h-full transition-all duration-300 ease-in-out border-r border-stone-200 dark:border-stone-800 bg-[#F5F5F4] dark:bg-[#292524] relative ${
                    // If Plan Mode OR Sidebar Open -> Width 80
                    // Else -> Width 0 (Hidden)
                    (viewMode === 'plan' || isSidebarOpen) ? 'w-80 translate-x-0' : 'w-0 -translate-x-full border-none'
                    }`}
            >
                {/* Inner Container to prevent content squishing while width animates */}
                <div className="w-80 h-full overflow-hidden">
                    {/* Close Button (Only show in Focus Mode when open) */}
                    {viewMode === 'focus' && isSidebarOpen && (
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="absolute top-4 right-4 z-50 p-1 text-stone-400 hover:text-stone-600 bg-transparent"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    )}

                    {sidebar}
                </div>
            </div>

            {/* 2. TOGGLE BUTTON (Visible only when Sidebar is CLOSED in Focus Mode) */}
            {viewMode === 'focus' && !isSidebarOpen && (
                <div className="absolute top-4 left-4 z-40">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-500 rounded-lg shadow-sm hover:text-orange-500 transition-colors"
                        title="Open Rituals"
                    >
                        {/* Sidebar Icon */}
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                    </button>
                </div>
            )}

            {/* 3. MAIN CONTENT (Resizes automatically via Flexbox) */}
            <div className="flex-1 flex flex-col min-w-0 z-10 transition-all duration-300">

                {children}
            </div>
        </div>
    )
}