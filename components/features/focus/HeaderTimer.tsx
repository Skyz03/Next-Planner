'use client'

import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square } from 'lucide-react'

export default function HeaderTimer() {
  const [isActive, setIsActive] = useState(false)
  const [seconds, setSeconds] = useState(0)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive])

  // Format MM:SS
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60)
    const s = totalSeconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const toggleTimer = () => {
    setIsActive(!isActive)
  }

  const stopTimer = () => {
    setIsActive(false)
    setSeconds(0)
  }

  return (
    <div className={`
      flex items-center gap-3 pl-3 pr-1.5 py-1.5 rounded-full border transition-all duration-300
      ${isActive 
        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 shadow-sm' 
        : 'bg-white dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-500'
      }
    `}>
       {/* Time Display */}
       <div className="font-mono text-sm font-bold tracking-wider w-12 text-center select-none">
          {formatTime(seconds)}
       </div>

       {/* Controls */}
       <div className="flex items-center gap-1">
          <button 
            onClick={toggleTimer}
            className={`p-1.5 rounded-full transition-colors ${isActive ? 'hover:bg-orange-200/50 dark:hover:bg-orange-800/50' : 'hover:bg-stone-100 dark:hover:bg-stone-700'}`}
            title={isActive ? "Pause" : "Start"}
          >
             {isActive ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          </button>
          
          {/* Stop Button (Only visible when has time) */}
          {(seconds > 0 || isActive) && (
            <button 
              onClick={stopTimer}
              className="p-1.5 rounded-full hover:bg-red-100 text-stone-400 hover:text-red-500 transition-colors"
              title="Stop & Reset"
            >
              <Square className="w-3 h-3 fill-current" />
            </button>
          )}
       </div>
    </div>
  )
}