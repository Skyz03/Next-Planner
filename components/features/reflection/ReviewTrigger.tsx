'use client'

import { useState } from 'react'
import WeeklyReviewModal from './WeeklyReviewModal'

export default function ReviewTrigger({ 
  data, 
  weekStart, 
  nextMonday 
}: { 
  data: any, 
  weekStart: string, 
  nextMonday: string 
}) {
  const [isOpen, setIsOpen] = useState(false)

  // Check if today is Weekend (Sat=6, Sun=0)
  const today = new Date().getDay()
  const isWeekend = today === 0 || today === 6

  if (!isWeekend) return null // Hide button on weekdays

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-stone-900 dark:bg-white text-white dark:text-stone-900 px-5 py-3 rounded-full font-bold shadow-2xl hover:scale-105 transition-transform flex items-center gap-2 animate-bounce-slow"
      >
        <span>✨</span>
        <span>Start Weekly Review</span>
      </button>

      <WeeklyReviewModal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        data={data}
        weekStart={weekStart}
        nextMonday={nextMonday}
      />
    </>
  )
}