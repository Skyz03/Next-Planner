'use client'

import { useOptimistic, startTransition } from 'react'
import { toggleTask, deleteTask } from '@/actions/task'
import EditableText from '../../ui/EditableText'

export default function TaskItem({ task }: { task: any }) {
  const [optimisticTask, setOptimisticStatus] = useOptimistic(
    task,
    (state, newStatus: boolean) => ({ ...state, is_completed: newStatus })
  )

  return (
    <div className={`group relative flex items-start gap-4 p-5 rounded-2xl border-2 transition-all duration-300 ${optimisticTask.is_completed
        ? 'bg-stone-50 dark:bg-stone-900 border-stone-100 dark:border-stone-800 opacity-60'
        : 'bg-white dark:bg-[#221F1D] border-stone-100 dark:border-stone-800 hover:border-orange-200 dark:hover:border-orange-900/50 shadow-sm hover:shadow-md hover:-translate-y-0.5'
      }`}>

      {/* Checkbox: Organic Circle */}
      <button
        onClick={async () => {
          const newStatus = !optimisticTask.is_completed
          startTransition(() => { setOptimisticStatus(newStatus) })
          await toggleTask(task.id, task.is_completed)
        }}
        className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${optimisticTask.is_completed
            ? 'bg-stone-400 border-stone-400 dark:bg-stone-600 dark:border-stone-600'
            : 'border-stone-300 dark:border-stone-600 hover:border-orange-400 bg-transparent'
          }`}
      >
        <svg className={`w-3.5 h-3.5 text-white transform transition-transform ${optimisticTask.is_completed ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </button>

      <div className="flex-1 min-w-0 pt-0.5">
        {!optimisticTask.is_completed ? (
          <EditableText
            id={task.id}
            initialText={task.title}
            type="task"
            className="text-lg font-medium text-stone-800 dark:text-stone-200"
          />
        ) : (
          <p className="text-lg text-stone-400 font-serif italic decoration-stone-300 line-through">
            {task.title}
          </p>
        )}

        {task.goals && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600/70 dark:text-orange-400/70 bg-orange-50 dark:bg-orange-900/20 px-2 py-0.5 rounded-full">
              {task.goals.title}
            </span>
          </div>
        )}
      </div>

      <form action={deleteTask} className="opacity-0 group-hover:opacity-100 transition-opacity">
        <input type="hidden" name="taskId" value={task.id} />
        <button className="text-stone-300 hover:text-red-400 p-2 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
        </button>
      </form>
    </div>
  )
}