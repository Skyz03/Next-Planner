'use client'

import { useOptimistic, startTransition } from 'react'
import { toggleTask, deleteTask } from '@/app/actions'
import EditableText from './EditableText' // <--- Import the new component

export default function TaskItem({ task }: { task: any }) {
  // 1. Setup Optimistic State
  const [optimisticTask, setOptimisticStatus] = useOptimistic(
    task,
    (state, newStatus: boolean) => ({ ...state, is_completed: newStatus })
  )

  return (
    <div className="group relative flex items-center gap-4 p-5 bg-white/40 dark:bg-slate-900/40 hover:bg-white dark:hover:bg-slate-900 rounded-2xl border border-white/60 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 shadow-sm hover:shadow-md transition-all duration-300">

      {/* 2. Checkbox */}
      <button 
        onClick={async () => {
          const newStatus = !optimisticTask.is_completed
          
          // A. Update UI instantly
          startTransition(() => {
            setOptimisticStatus(newStatus)
          })
          
          // B. Update Server in background
          await toggleTask(task.id, task.is_completed)
        }}
        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
          optimisticTask.is_completed 
            ? 'bg-indigo-500 border-indigo-500' 
            : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-400'
        }`}
      >
        <svg 
          className={`w-3.5 h-3.5 text-white transform transition-transform ${optimisticTask.is_completed ? 'scale-100' : 'scale-0'}`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </button>

      {/* 3. Task Title (Editable vs View) */}
      <div className="flex-1">
        {!optimisticTask.is_completed ? (
          // If Active: Show Editable Input
          <EditableText 
            id={task.id} 
            initialText={task.title} 
            type="task" 
            className="text-lg font-medium text-slate-800 dark:text-slate-200"
          />
        ) : (
          // If Completed: Show Strikethrough Text (Non-editable)
          <p className="text-lg font-medium transition-all duration-300 line-through text-slate-400 dark:text-slate-600">
            {task.title}
          </p>
        )}

        {/* Goal Badge */}
        {task.goals && (
          <span className="inline-block mt-1 px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider rounded-full border border-indigo-100 dark:border-indigo-500/20">
            {task.goals.title}
          </span>
        )}
      </div>

      {/* 4. Delete Button (Visible on Hover) */}
      <form action={deleteTask} className="opacity-0 group-hover:opacity-100 transition-opacity">
        <input type="hidden" name="taskId" value={task.id} />
        <button className="text-slate-400 hover:text-red-500 p-2 transition-colors" title="Delete Task">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </form>

      {/* Hover Glow Effect */}
      <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 dark:bg-indigo-500/10 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
    </div>
  )
}