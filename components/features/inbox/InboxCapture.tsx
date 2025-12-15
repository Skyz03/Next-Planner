'use client'

import { useState, useEffect, useRef } from 'react'
import { addTask } from '@/actions/task' // Check this path

export default function InboxCapture() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [priority, setPriority] = useState('medium') // Default state
  const [isSaving, setIsSaving] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // 1. Global Hotkey Listener (Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen((prev) => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // 2. Auto-focus
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setPriority('medium') // Reset priority on open
    }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setIsSaving(true)

    // Construct FormData for the Server Action
    const formData = new FormData()
    formData.append('title', input)
    formData.append('date_type', 'inbox') // Flags it as Inbox
    formData.append('priority', priority) // Sends the selected priority

    await addTask(formData)

    // Reset and Close
    setInput('')
    setIsSaving(false)
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="animate-in fade-in fixed inset-0 z-[100] flex items-start justify-center bg-black/20 pt-[20vh] backdrop-blur-sm duration-200">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

      <div className="animate-in zoom-in-95 relative w-full max-w-2xl overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-2xl duration-200 dark:border-stone-800 dark:bg-[#262626]">
        {/* WRAP IN FORM TO ENABLE "ENTER" KEY SUBMISSION */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center gap-4 px-6 py-6">
            <div className="flex-none rounded-xl bg-stone-100 p-3 text-stone-500 dark:bg-stone-800">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 2L11 13"></path>
                <path d="M22 2l-7 20-4-9-9-4 20-7z"></path>
              </svg>
            </div>

            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Capture a thought..."
              className="flex-1 bg-transparent font-serif text-2xl text-stone-800 outline-none placeholder:text-stone-300 dark:text-stone-100"
              autoComplete="off"
            />

            {isSaving && (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent"></div>
            )}
          </div>

          {/* Footer / Controls */}
          <div className="flex items-center justify-between border-t border-stone-100 bg-stone-50 px-6 py-3 dark:border-stone-800 dark:bg-stone-900/50">
            {/* Priority Toggles */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPriority('low')}
                className={`rounded border px-2 py-1 text-[10px] font-bold tracking-wider uppercase transition-all ${priority === 'low' ? 'border-stone-300 bg-white text-stone-600 shadow-sm dark:bg-stone-700 dark:text-stone-200' : 'border-transparent text-stone-400 hover:bg-stone-200/50'}`}
              >
                Low
              </button>
              <button
                type="button"
                onClick={() => setPriority('medium')}
                className={`rounded border px-2 py-1 text-[10px] font-bold tracking-wider uppercase transition-all ${priority === 'medium' ? 'border-orange-200 bg-white text-orange-600 shadow-sm dark:bg-stone-700 dark:text-orange-400' : 'border-transparent text-stone-400 hover:bg-stone-200/50'}`}
              >
                Medium
              </button>
              <button
                type="button"
                onClick={() => setPriority('high')}
                className={`rounded border px-2 py-1 text-[10px] font-bold tracking-wider uppercase transition-all ${priority === 'high' ? 'border-red-200 bg-white text-red-600 shadow-sm dark:bg-stone-700 dark:text-red-400' : 'border-transparent text-stone-400 hover:bg-stone-200/50'}`}
              >
                High
              </button>
            </div>

            <div className="flex gap-4 text-xs text-stone-400">
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-stone-200 bg-white px-1.5 py-0.5 font-sans text-[10px] shadow-sm dark:border-stone-700 dark:bg-stone-800">
                  ↵
                </kbd>
                Save
              </span>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-stone-200 bg-white px-1.5 py-0.5 font-sans text-[10px] shadow-sm dark:border-stone-700 dark:bg-stone-800">
                  Esc
                </kbd>
                Close
              </span>
            </div>
          </div>

          {/* HIDDEN SUBMIT BUTTON (The Magic Fix for "Enter") */}
          <button type="submit" className="hidden" />
        </form>
      </div>
    </div>
  )
}
