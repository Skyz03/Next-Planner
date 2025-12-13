'use client'

import { useState } from 'react'
import { generateStepsForGoal } from '@/app/actions'

export default function AIGenerateButton({ goalId, goalTitle }: { goalId: string, goalTitle: string }) {
  const [loading, setLoading] = useState(false)

  async function handleGenerate() {
    setLoading(true)
    await generateStepsForGoal(goalId, goalTitle)
    setLoading(false)
  }

  return (
    <button 
      onClick={handleGenerate} 
      disabled={loading}
      className={`group/ai relative p-1 rounded-md transition-all ${loading ? 'cursor-wait' : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/30'}`}
      title="Ask AI to brainstorm steps"
    >
      {loading ? (
        // Loading Spinner
        <div className="w-3 h-3 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
      ) : (
        // Sparkle Icon
        <svg 
          className="w-3 h-3 text-stone-300 group-hover/ai:text-indigo-500 transition-colors" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z" />
          <path d="M17 4a2 2 0 0 0 2 2a2 2 0 0 0 -2 2a2 2 0 0 0 -2 -2a2 2 0 0 0 2 -2" />
          <path d="M19 11h2m-1 -1v2" />
        </svg>
      )}
    </button>
  )
}