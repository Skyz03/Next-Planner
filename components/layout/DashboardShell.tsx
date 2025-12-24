'use client'

import { useState, useEffect } from 'react'
import InboxCapture from '../features/inbox/InboxCapture'
import MobileSidebar from './MobileSidebar' // Ensure this exists

export default function DashboardShell({
  sidebar,
  children,
  viewMode,
}: {
  sidebar: React.ReactNode
  children: React.ReactNode
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
    // ✅ CHANGED: flex-col for mobile, md:flex-row for desktop
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden bg-[#FAFAF9] dark:bg-[#1C1917]">
      <InboxCapture />

      {/* --- MOBILE SIDEBAR TRIGGER (Hidden on Desktop) --- */}
      <div className="absolute top-4 left-4 z-50 md:hidden">
        <MobileSidebar>{sidebar}</MobileSidebar>
      </div>

      {/* --- DESKTOP SIDEBAR CONTAINER (Hidden on Mobile) --- */}
      <div
        className={`hidden md:flex relative h-full flex-none border-r border-stone-200 bg-[#F5F5F4] transition-all duration-300 ease-in-out dark:border-stone-800 dark:bg-[#292524] ${
          // If Plan Mode OR Sidebar Open -> Width 80
          // Else -> Width 0 (Hidden)
          viewMode === 'plan' || isSidebarOpen
            ? 'w-80 translate-x-0'
            : 'w-0 -translate-x-full border-none'
          }`}
      >
        {/* Inner Container to prevent content squishing while width animates */}
        <div className="h-full w-80 overflow-hidden">
          {/* Close Button (Only show in Focus Mode when open) */}
          {viewMode === 'focus' && isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-4 right-4 z-50 bg-transparent p-1 text-stone-400 hover:text-stone-600"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          )}

          {sidebar}
        </div>
      </div>

      {/* --- DESKTOP TOGGLE BUTTON (Visible only when Sidebar is CLOSED in Focus Mode) --- */}
      {viewMode === 'focus' && !isSidebarOpen && (
        <div className="absolute top-4 left-4 z-40 hidden md:block">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg border border-stone-200 bg-white p-2 text-stone-500 shadow-sm transition-colors hover:text-orange-500 dark:border-stone-700 dark:bg-stone-800"
            title="Open Rituals"
          >
            {/* Sidebar Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
          </button>
        </div>
      )}

      {/* --- MAIN CONTENT (Resizes automatically via Flexbox) --- */}
      <div className="z-10 flex min-w-0 flex-1 flex-col transition-all duration-300 relative">
        {children}
      </div>
    </div>
  )
}