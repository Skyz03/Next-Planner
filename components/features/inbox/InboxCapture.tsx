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
                setIsOpen(prev => !prev)
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
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">

            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={() => setIsOpen(false)} />

            <div className="relative w-full max-w-2xl bg-white dark:bg-[#262626] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden animate-in zoom-in-95 duration-200">

                {/* WRAP IN FORM TO ENABLE "ENTER" KEY SUBMISSION */}
                <form onSubmit={handleSubmit} className="relative">
                    <div className="flex items-center px-6 py-6 gap-4">
                        <div className="flex-none p-3 bg-stone-100 dark:bg-stone-800 rounded-xl text-stone-500">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4 20-7z"></path></svg>
                        </div>

                        <input
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Capture a thought..."
                            className="flex-1 bg-transparent text-2xl font-serif text-stone-800 dark:text-stone-100 placeholder:text-stone-300 outline-none"
                            autoComplete="off"
                        />

                        {isSaving && (
                            <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                        )}
                    </div>

                    {/* Footer / Controls */}
                    <div className="px-6 py-3 bg-stone-50 dark:bg-stone-900/50 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center">

                        {/* Priority Toggles */}
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setPriority('low')}
                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all border ${priority === 'low' ? 'bg-white dark:bg-stone-700 text-stone-600 dark:text-stone-200 border-stone-300 shadow-sm' : 'text-stone-400 border-transparent hover:bg-stone-200/50'}`}
                            >
                                Low
                            </button>
                            <button
                                type="button"
                                onClick={() => setPriority('medium')}
                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all border ${priority === 'medium' ? 'bg-white dark:bg-stone-700 text-orange-600 dark:text-orange-400 border-orange-200 shadow-sm' : 'text-stone-400 border-transparent hover:bg-stone-200/50'}`}
                            >
                                Medium
                            </button>
                            <button
                                type="button"
                                onClick={() => setPriority('high')}
                                className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-all border ${priority === 'high' ? 'bg-white dark:bg-stone-700 text-red-600 dark:text-red-400 border-red-200 shadow-sm' : 'text-stone-400 border-transparent hover:bg-stone-200/50'}`}
                            >
                                High
                            </button>
                        </div>

                        <div className="flex gap-4 text-xs text-stone-400">
                            <span className="flex items-center gap-1">
                                <kbd className="font-sans bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-1.5 py-0.5 shadow-sm text-[10px]">↵</kbd>
                                Save
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="font-sans bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded px-1.5 py-0.5 shadow-sm text-[10px]">Esc</kbd>
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