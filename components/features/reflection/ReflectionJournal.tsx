'use client'

import { useState } from 'react'
import { saveReflection } from '@/actions/reflections'

export default function ReflectionJournal({
  dateStr,
  initialData,
  viewMode, // 'week' | 'month'
}: {
  dateStr: string
  initialData: any
  viewMode: 'week' | 'month'
}) {
  const [energy, setEnergy] = useState(initialData?.energy_rating || 3)
  const [isSaving, setIsSaving] = useState(false)

  // 1. Dynamic Labels based on View Mode
  const title = viewMode === 'month' ? 'Monthly Review' : 'Weekly Debrief'
  const nextStepsLabel = viewMode === 'month' ? "Next Month's Big 3" : "Next Week's Big 3"
  const placeholder =
    viewMode === 'month'
      ? 'Review the big picture. Did you move closer to your strategic goals?'
      : 'What worked? What blocked you? Write it down...'

  const handleSave = async (formData: FormData) => {
    setIsSaving(true)
    await saveReflection(dateStr, formData)
    setIsSaving(false)
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-[#262626]">
      <div className="mb-6 flex items-center gap-2">
        <div className="rounded-lg bg-stone-100 p-2 text-stone-500 dark:bg-stone-800">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </div>
        {/* Dynamic Title */}
        <h3 className="text-xs font-bold tracking-widest text-stone-500 uppercase">{title}</h3>
      </div>

      <form action={handleSave} className="flex flex-1 flex-col gap-6">
        <input type="hidden" name="energy" value={energy} />

        {/* Energy Rating */}
        <div>
          <label className="mb-3 block text-xs font-bold tracking-widest text-stone-400 uppercase">
            How did you feel?
          </label>
          <div className="flex justify-between gap-2 rounded-xl bg-stone-100 p-1 dark:bg-stone-800/50">
            {[1, 2, 3, 4, 5].map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => setEnergy(level)}
                className={`flex-1 rounded-lg py-2 text-lg transition-all ${
                  energy === level
                    ? 'scale-105 bg-white shadow-sm dark:bg-stone-600'
                    : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
                }`}
              >
                {level === 1
                  ? '😫'
                  : level === 2
                    ? '😕'
                    : level === 3
                      ? '😐'
                      : level === 4
                        ? '🙂'
                        : '🔥'}
              </button>
            ))}
          </div>
        </div>

        {/* Notes Area */}
        <div className="flex-1">
          <label className="mb-2 block text-xs font-bold tracking-widest text-stone-400 uppercase">
            Notes & Observations
          </label>
          <textarea
            name="notes"
            defaultValue={initialData?.reflection_text}
            placeholder={placeholder}
            className="h-32 w-full resize-none rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm text-stone-700 focus:ring-2 focus:ring-orange-500/20 focus:outline-none md:h-full dark:border-stone-800 dark:bg-stone-900/50 dark:text-stone-200"
          />
        </div>

        {/* Forward Planning */}
        <div>
          <label className="mb-3 block text-xs font-bold tracking-widest text-orange-500 uppercase">
            {nextStepsLabel}
          </label>
          <div className="space-y-2">
            <input
              name="goal_1"
              defaultValue={initialData?.next_week_goals?.[0]}
              placeholder="1. Most important outcome..."
              className="w-full border-b border-stone-200 bg-transparent py-2 text-sm transition-colors outline-none focus:border-orange-500 dark:border-stone-700"
            />
            <input
              name="goal_2"
              defaultValue={initialData?.next_week_goals?.[1]}
              placeholder="2. Secondary objective..."
              className="w-full border-b border-stone-200 bg-transparent py-2 text-sm transition-colors outline-none focus:border-orange-500 dark:border-stone-700"
            />
            <input
              name="goal_3"
              defaultValue={initialData?.next_week_goals?.[2]}
              placeholder="3. Third priority..."
              className="w-full border-b border-stone-200 bg-transparent py-2 text-sm transition-colors outline-none focus:border-orange-500 dark:border-stone-700"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-900 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 dark:bg-stone-100 dark:text-stone-900"
        >
          {isSaving ? 'Saving...' : 'Commit to Plan'}
        </button>
      </form>
    </div>
  )
}
