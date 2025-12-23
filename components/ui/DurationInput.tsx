'use client'

import { useState, useRef, useEffect } from 'react'
import { Clock } from 'lucide-react'

export default function DurationInput({ defaultMinutes = 60 }: { defaultMinutes?: number }) {
  const [isOpen, setIsOpen] = useState(false)
  const [hours, setHours] = useState<string | number>(Math.floor(defaultMinutes / 60))
  const [minutes, setMinutes] = useState<string | number>(defaultMinutes % 60)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calculate total minutes for the hidden input
  const hVal = typeof hours === 'string' ? parseInt(hours) || 0 : hours
  const mVal = typeof minutes === 'string' ? parseInt(minutes) || 0 : minutes
  const totalMinutes = (hVal * 60) + mVal

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={containerRef}>
      {/* 1. The Value sent to Server Action */}
      <input type="hidden" name="duration" value={totalMinutes} />
      
      {/* 2. The Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 rounded-md px-1.5 py-1 text-[10px] font-medium transition-all ${
          isOpen 
            ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400 ring-1 ring-orange-200 dark:ring-orange-800' 
            : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:text-stone-500 dark:hover:bg-stone-800 dark:hover:text-stone-300'
        }`}
        title="Estimated Duration"
      >
        <Clock className="w-3 h-3" />
        <span>
            {hVal > 0 ? `${hVal}h` : ''}{mVal > 0 ? ` ${mVal}m` : ''}
            {hVal === 0 && mVal === 0 && '0m'}
        </span>
      </button>

      {/* 3. The Popover Panel */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-36 rounded-xl border border-stone-200 bg-white p-3 shadow-xl shadow-stone-200/50 animate-in fade-in zoom-in-95 duration-200 dark:border-stone-800 dark:bg-[#1C1917] dark:shadow-none">
            
            {/* Inputs Row */}
            <div className="flex items-center gap-2 mb-3">
                <div className="flex-1">
                    <label className="block text-[9px] font-bold text-stone-400 uppercase text-center mb-1">Hr</label>
                    <input 
                        type="number" 
                        min="0"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        className="w-full rounded-lg bg-stone-50 border border-stone-200 text-center text-sm font-bold py-1.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200"
                    />
                </div>
                <div className="text-stone-300 pt-4 font-bold">:</div>
                <div className="flex-1">
                    <label className="block text-[9px] font-bold text-stone-400 uppercase text-center mb-1">Min</label>
                    <input 
                        type="number" 
                        min="0"
                        step="15"
                        value={minutes}
                        onChange={(e) => setMinutes(e.target.value)}
                        className="w-full rounded-lg bg-stone-50 border border-stone-200 text-center text-sm font-bold py-1.5 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all dark:bg-stone-800 dark:border-stone-700 dark:text-stone-200"
                    />
                </div>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-1.5">
                {[15, 30, 45, 60, 90, 120].map(m => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => {
                            setHours(Math.floor(m / 60))
                            setMinutes(m % 60)
                            setIsOpen(false)
                        }}
                        className="px-1 py-1.5 rounded-md bg-stone-100 text-[10px] font-medium text-stone-500 hover:bg-orange-100 hover:text-orange-600 transition-colors dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-orange-900/30 dark:hover:text-orange-400"
                    >
                        {m < 60 ? `${m}m` : `${m/60}h`}
                    </button>
                ))}
            </div>
        </div>
      )}
    </div>
  )
}