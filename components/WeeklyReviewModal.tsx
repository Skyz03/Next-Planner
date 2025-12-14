'use client'

import { useState, useEffect } from 'react'
import { migrateUncompletedTasks, saveWeeklyReflection } from '@/app/actions'
import { useRouter } from 'next/navigation'

export default function WeeklyReviewModal({ 
  isOpen, 
  onClose, 
  data, 
  weekStart,
  nextMonday 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  data: any,
  weekStart: string,
  nextMonday: string
}) {
  const [step, setStep] = useState(0) // 0: Intro, 1: Clear, 2: Celebrate, 3: Align
  const [reflection, setReflection] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  if (!isOpen || !data) return null

  const steps = [
    // STEP 0: INTRO
    <div key="intro" className="text-center space-y-6 py-8">
       <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center mx-auto text-3xl">🧘</div>
       <div>
         <h2 className="text-2xl font-serif font-bold text-stone-800 dark:text-stone-100">Sunday Review</h2>
         <p className="text-stone-500 mt-2">Take 2 minutes to close your loops and align for the week ahead.</p>
       </div>
       <button onClick={() => setStep(1)} className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20">
         Start Review
       </button>
    </div>,

    // STEP 1: CLEAR THE DECKS
    <div key="clear" className="space-y-6">
       <header>
          <h3 className="text-xl font-serif font-bold">Clear the Decks</h3>
          <p className="text-sm text-stone-500">You have {data.uncompleted?.length || 0} unfinished tasks. Be honest—move them or delete them.</p>
       </header>

       <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar bg-stone-50 dark:bg-stone-900/50 p-4 rounded-xl border border-stone-200 dark:border-stone-800">
          {data.uncompleted?.length === 0 ? (
             <p className="text-center text-stone-400 italic py-8">All clean! Nothing to clear.</p>
          ) : (
             data.uncompleted?.map((t: any) => (
               <div key={t.id} className="flex items-center justify-between bg-white dark:bg-stone-800 p-3 rounded-lg border border-stone-100 dark:border-stone-700">
                  <span className="text-sm font-medium truncate max-w-[200px]">{t.title}</span>
                  <span className="text-[10px] text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">Overdue</span>
               </div>
             ))
          )}
       </div>

       {data.uncompleted?.length > 0 && (
         <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={async () => {
                 await migrateUncompletedTasks(data.uncompleted.map((t:any) => t.id), 'move-next-week', nextMonday)
                 setStep(2)
              }}
              className="p-3 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 transition-colors"
            >
              🗓️ Move All to Next Week
            </button>
            <button 
              onClick={async () => {
                 await migrateUncompletedTasks(data.uncompleted.map((t:any) => t.id), 'move-backlog')
                 setStep(2)
              }}
              className="p-3 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl text-xs font-bold text-stone-600 dark:text-stone-300 transition-colors"
            >
              📥 Return to Backlog
            </button>
         </div>
       )}
       {data.uncompleted?.length === 0 && (
         <button onClick={() => setStep(2)} className="w-full bg-stone-800 text-white py-3 rounded-xl font-bold">Next</button>
       )}
    </div>,

    // STEP 2: CELEBRATE
    <div key="celebrate" className="text-center space-y-8 py-4">
       <h3 className="text-xl font-serif font-bold">Weekly Intelligence</h3>
       
       <div className="grid grid-cols-2 gap-4">
          <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-2xl border border-green-100 dark:border-green-900/50">
             <div className="text-4xl font-bold text-green-600 dark:text-green-400">{data.completedCount}</div>
             <div className="text-xs font-bold uppercase tracking-wider text-green-800/60 dark:text-green-200/60 mt-1">Completed</div>
          </div>
          <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-900/50">
             <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
               {data.totalCount > 0 ? Math.round((data.completedCount / data.totalCount) * 100) : 0}%
             </div>
             <div className="text-xs font-bold uppercase tracking-wider text-blue-800/60 dark:text-blue-200/60 mt-1">Velocity</div>
          </div>
       </div>

       <p className="text-stone-500 text-sm max-w-xs mx-auto">
         "Success is the sum of small efforts, repeated day in and day out."
       </p>

       <button onClick={() => setStep(3)} className="w-full bg-stone-800 hover:bg-black text-white py-3 rounded-xl font-bold transition-all">
         Continue
       </button>
    </div>,

    // STEP 3: ALIGN
    <div key="align" className="space-y-6">
       <header>
          <h3 className="text-xl font-serif font-bold">Align & Reflect</h3>
          <p className="text-sm text-stone-500">Did this week move your Top Goal forward? What did you learn?</p>
       </header>

       <textarea 
          autoFocus
          className="w-full h-32 bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700 rounded-xl p-4 text-sm focus:ring-2 ring-orange-500/50 outline-none resize-none"
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
         className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-orange-500/20 disabled:opacity-70"
       >
         {isSubmitting ? 'Saving...' : 'Complete Review'}
       </button>
    </div>
  ]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-stone-900/30 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
       <div className="bg-white dark:bg-[#1C1917] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-stone-100 dark:border-stone-800">
          {/* Progress Bar */}
          <div className="h-1 bg-stone-100 dark:bg-stone-800">
             <div className="h-full bg-orange-500 transition-all duration-500" style={{ width: `${((step + 1) / 4) * 100}%` }}></div>
          </div>
          
          <div className="p-8">
             {steps[step]}
          </div>

          {step > 0 && (
            <div className="bg-stone-50 dark:bg-stone-900/50 p-3 text-center">
               <button onClick={onClose} className="text-xs text-stone-400 hover:text-stone-600 font-medium">Skip Review</button>
            </div>
          )}
       </div>
    </div>
  )
}