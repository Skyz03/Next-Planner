'use client'

import { useOptimistic, startTransition } from 'react'
import { toggleTask, deleteTask } from '@/actions/task'
import EditableText from '../../ui/EditableText'

export default function TaskItem({ task }: { task: any }) {
  const [optimisticTask, setOptimisticStatus] = useOptimistic(
    task,
    (state, newStatus: boolean) => ({ ...state, is_completed: newStatus }),
  )

  return (
    <div
      className={`group relative flex items-start gap-4 rounded-2xl border-2 p-5 transition-all duration-300 ${
        optimisticTask.is_completed
          ? 'border-stone-100 bg-stone-50 opacity-60 dark:border-stone-800 dark:bg-stone-900'
          : 'border-stone-100 bg-white shadow-sm hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md dark:border-stone-800 dark:bg-[#221F1D] dark:hover:border-orange-900/50'
      }`}
    >
      {/* Checkbox: Organic Circle */}
      <button
        onClick={async () => {
          const newStatus = !optimisticTask.is_completed
          startTransition(() => {
            setOptimisticStatus(newStatus)
          })
          await toggleTask(task.id, task.is_completed)
        }}
        className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all duration-300 ${
          optimisticTask.is_completed
            ? 'border-stone-400 bg-stone-400 dark:border-stone-600 dark:bg-stone-600'
            : 'border-stone-300 bg-transparent hover:border-orange-400 dark:border-stone-600'
        }`}
      >
        <svg
          className={`h-3.5 w-3.5 transform text-white transition-transform ${optimisticTask.is_completed ? 'scale-100' : 'scale-0'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </button>

      <div className="min-w-0 flex-1 pt-0.5">
        {!optimisticTask.is_completed ? (
          <EditableText
            id={task.id}
            initialText={task.title}
            type="task"
            className="text-lg font-medium text-stone-800 dark:text-stone-200"
          />
        ) : (
          <p className="font-serif text-lg text-stone-400 italic line-through decoration-stone-300">
            {task.title}
          </p>
        )}

        {task.goals && (
          <div className="mt-2 flex items-center gap-2">
            <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-bold tracking-wider text-orange-600/70 uppercase dark:bg-orange-900/20 dark:text-orange-400/70">
              {task.goals.title}
            </span>
          </div>
        )}
      </div>

      <form action={deleteTask} className="opacity-0 transition-opacity group-hover:opacity-100">
        <input type="hidden" name="taskId" value={task.id} />
        <button className="p-2 text-stone-300 transition-colors hover:text-red-400">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </form>
    </div>
  )
}
