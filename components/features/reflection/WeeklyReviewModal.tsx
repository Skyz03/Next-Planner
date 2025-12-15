'use client'

import { useState, useEffect } from 'react'
import { migrateUncompletedTasks, saveWeeklyReflection } from '@/actions/reflections'
import { useRouter } from 'next/navigation'

export default function WeeklyReviewModal({
  isOpen,
  onClose,
  data,
  weekStart,
  nextMonday,
}: {
  isOpen: boolean
  onClose: () => void
  data: any
  weekStart: string
  nextMonday: string
}) {
  const [step, setStep] = useState(0) // 0: Intro, 1: Clear, 2: Celebrate, 3: Align
  const [reflection, setReflection] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  if (!isOpen || !data) return null

  const steps = [
    // STEP 0: INTRO
    <div key="intro" className="space-y-6 py-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 text-3xl dark:bg-stone-800">
        🧘
      </div>
      <div>
        <h2 className="font-serif text-2xl font-bold text-stone-800 dark:text-stone-100">
          Sunday Review
        </h2>
        <p className="mt-2 text-stone-500">
          Take 2 minutes to close your loops and align for the week ahead.
        </p>
      </div>
      <button
        onClick={() => setStep(1)}
        className="rounded-xl bg-orange-500 px-8 py-3 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600"
      >
        Start Review
      </button>
    </div>,

    // STEP 1: CLEAR THE DECKS
    <div key="clear" className="space-y-6">
      <header>
        <h3 className="font-serif text-xl font-bold">Clear the Decks</h3>
        <p className="text-sm text-stone-500">
          You have {data.uncompleted?.length || 0} unfinished tasks. Be honest—move them or delete
          them.
        </p>
      </header>

      <div className="custom-scrollbar max-h-[300px] space-y-2 overflow-y-auto rounded-xl border border-stone-200 bg-stone-50 p-4 pr-2 dark:border-stone-800 dark:bg-stone-900/50">
        {data.uncompleted?.length === 0 ? (
          <p className="py-8 text-center text-stone-400 italic">All clean! Nothing to clear.</p>
        ) : (
          data.uncompleted?.map((t: any) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-stone-100 bg-white p-3 dark:border-stone-700 dark:bg-stone-800"
            >
              <span className="max-w-[200px] truncate text-sm font-medium">{t.title}</span>
              <span className="rounded bg-red-50 px-2 py-1 text-[10px] text-red-400 dark:bg-red-900/20">
                Overdue
              </span>
            </div>
          ))
        )}
      </div>

      {data.uncompleted?.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={async () => {
              await migrateUncompletedTasks(
                data.uncompleted.map((t: any) => t.id),
                'move-next-week',
                nextMonday,
              )
              setStep(2)
            }}
            className="rounded-xl border border-stone-200 p-3 text-xs font-bold text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            🗓️ Move All to Next Week
          </button>
          <button
            onClick={async () => {
              await migrateUncompletedTasks(
                data.uncompleted.map((t: any) => t.id),
                'move-backlog',
              )
              setStep(2)
            }}
            className="rounded-xl border border-stone-200 p-3 text-xs font-bold text-stone-600 transition-colors hover:bg-stone-100 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            📥 Return to Backlog
          </button>
        </div>
      )}
      {data.uncompleted?.length === 0 && (
        <button
          onClick={() => setStep(2)}
          className="w-full rounded-xl bg-stone-800 py-3 font-bold text-white"
        >
          Next
        </button>
      )}
    </div>,

    // STEP 2: CELEBRATE
    <div key="celebrate" className="space-y-8 py-4 text-center">
      <h3 className="font-serif text-xl font-bold">Weekly Intelligence</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-green-100 bg-green-50 p-6 dark:border-green-900/50 dark:bg-green-900/20">
          <div className="text-4xl font-bold text-green-600 dark:text-green-400">
            {data.completedCount}
          </div>
          <div className="mt-1 text-xs font-bold tracking-wider text-green-800/60 uppercase dark:text-green-200/60">
            Completed
          </div>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 dark:border-blue-900/50 dark:bg-blue-900/20">
          <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
            {data.totalCount > 0 ? Math.round((data.completedCount / data.totalCount) * 100) : 0}%
          </div>
          <div className="mt-1 text-xs font-bold tracking-wider text-blue-800/60 uppercase dark:text-blue-200/60">
            Velocity
          </div>
        </div>
      </div>

      <p className="mx-auto max-w-xs text-sm text-stone-500">
        "Success is the sum of small efforts, repeated day in and day out."
      </p>

      <button
        onClick={() => setStep(3)}
        className="w-full rounded-xl bg-stone-800 py-3 font-bold text-white transition-all hover:bg-black"
      >
        Continue
      </button>
    </div>,

    // STEP 3: ALIGN
    <div key="align" className="space-y-6">
      <header>
        <h3 className="font-serif text-xl font-bold">Align & Reflect</h3>
        <p className="text-sm text-stone-500">
          Did this week move your Top Goal forward? What did you learn?
        </p>
      </header>

      <textarea
        autoFocus
        className="h-32 w-full resize-none rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm ring-orange-500/50 outline-none focus:ring-2 dark:border-stone-700 dark:bg-stone-800/50"
        placeholder="I learned that..."
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
      />

      <button
        disabled={isSubmitting}
        onClick={async () => {
          setIsSubmitting(true)
          await saveWeeklyReflection(weekStart, data.completedCount, data.totalCount, reflection)
          setIsSubmitting(false)
          onClose()
          router.refresh()
        }}
        className="w-full rounded-xl bg-orange-500 py-3 font-bold text-white shadow-lg shadow-orange-500/20 transition-all hover:bg-orange-600 disabled:opacity-70"
      >
        {isSubmitting ? 'Saving...' : 'Complete Review'}
      </button>
    </div>,
  ]

  return (
    <div className="animate-in fade-in fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/30 p-4 backdrop-blur-sm duration-200 dark:bg-black/60">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-stone-100 bg-white shadow-2xl dark:border-stone-800 dark:bg-[#1C1917]">
        {/* Progress Bar */}
        <div className="h-1 bg-stone-100 dark:bg-stone-800">
          <div
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: `${((step + 1) / 4) * 100}%` }}
          ></div>
        </div>

        <div className="p-8">{steps[step]}</div>

        {step > 0 && (
          <div className="bg-stone-50 p-3 text-center dark:bg-stone-900/50">
            <button
              onClick={onClose}
              className="text-xs font-medium text-stone-400 hover:text-stone-600"
            >
              Skip Review
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
