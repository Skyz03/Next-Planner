'use client'

import { useState } from 'react'
import { saveReflection } from '@/actions/reflections'

export default function ReflectionJournal({
  dateStr,
  initialData,
  viewMode,
}: {
  dateStr: string
  initialData: any
  viewMode: 'week' | 'month'
}) {
  // 1. Initialize State based on whether data already exists
  const [isSubmitted, setIsSubmitted] = useState(!!initialData)
  const [isEditing, setIsEditing] = useState(false)

  const [energy, setEnergy] = useState(initialData?.energy_rating || 3)
  const [isSaving, setIsSaving] = useState(false)

  // Dynamic Labels
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
    setIsSubmitted(true)
    setIsEditing(false) // Exit edit mode
  }

  // --- 🟢 COMPLETED STATE (READ-ONLY) ---
  if (isSubmitted && !isEditing) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 p-8 text-center shadow-inner dark:border-stone-800 dark:bg-[#201e1d]">
        {/* Success Icon */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-stone-100 bg-white shadow-sm dark:border-stone-700 dark:bg-[#262626]">
          <div className="text-emerald-500">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        </div>

        <h3 className="mb-2 font-serif text-2xl font-bold text-stone-800 dark:text-stone-100">
          You're all set.
        </h3>
        <p className="mx-auto max-w-xs text-sm leading-relaxed text-stone-500">
          Your {viewMode === 'week' ? 'weekly' : 'monthly'} reflection is saved. <br />
          Time to execute.
        </p>

        {/* Summary of Choice */}
        <div className="mt-8 flex gap-3 rounded-lg border border-stone-200 bg-white px-4 py-2 font-mono text-xs text-stone-400 dark:border-stone-800 dark:bg-[#262626]">
          <span>Energy: {energy}/5</span>
          <span>•</span>
          <span>{new Date().toLocaleDateString()}</span>
        </div>

        {/* Edit Button (Subtle) */}
        <button
          onClick={() => setIsEditing(true)}
          className="mt-8 text-xs font-bold text-stone-400 underline decoration-stone-300 underline-offset-4 transition-colors hover:text-stone-600 dark:hover:text-stone-300"
        >
          Edit Entry
        </button>
      </div>
    )
  }

  // --- ✍️ EDITING STATE (The Form) ---
  return (
    <div className="flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-[#262626]">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
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
          <h3 className="text-xs font-bold tracking-widest text-stone-500 uppercase">{title}</h3>
        </div>

        {/* Cancel Edit Button */}
        {isSubmitted && (
          <button
            onClick={() => setIsEditing(false)}
            className="text-xs text-stone-400 transition-colors hover:text-red-500"
          >
            Cancel
          </button>
        )}
      </div>

      <form action={handleSave} className="flex flex-1 flex-col gap-6">
        <input type="hidden" name="energy" value={energy} />

        {/* 1. SUBJECTIVE ENERGY SCORE */}
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

        {/* 2. THE JOURNAL */}
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

        {/* 3. PLANNING AHEAD */}
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
          {isSaving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent dark:border-stone-900"></div>
              Saving...
            </>
          ) : (
            'Commit to Plan'
          )}
        </button>
      </form>
    </div>
  )
}
