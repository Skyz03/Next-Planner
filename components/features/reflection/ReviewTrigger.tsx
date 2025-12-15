'use client'

import { useState } from 'react'
import WeeklyReviewModal from './WeeklyReviewModal'

export default function ReviewTrigger({
  data,
  weekStart,
  nextMonday,
}: {
  data: any
  weekStart: string
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
        className="animate-bounce-slow fixed right-6 bottom-6 z-50 flex items-center gap-2 rounded-full bg-stone-900 px-5 py-3 font-bold text-white shadow-2xl transition-transform hover:scale-105 dark:bg-white dark:text-stone-900"
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
