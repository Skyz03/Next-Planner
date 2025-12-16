'use client'

import { Clock, Target, MoreHorizontal, CheckCircle2, Circle } from 'lucide-react'
import EditableText from '@/components/ui/EditableText'
import { toggleTask, deleteTask } from '@/actions/task'

export default function TaskItem({ task }: { task: any }) {
  // Determine Priority Color
  const priorityColor =
    task.priority === 'high' ? 'bg-orange-500' :
      task.priority === 'medium' ? 'bg-amber-400' :
        'bg-stone-300 dark:bg-stone-600'

  return (
    <div className="group relative w-full mb-3 select-none">
      {/* THE CARD CONTAINER */}
      <div className="relative overflow-hidden rounded-xl bg-white dark:bg-[#262626] border border-stone-200 dark:border-stone-800 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-orange-300/50 dark:hover:border-orange-500/30">

        {/* Priority Strip (Left Side) */}
        <div className={`absolute top-0 bottom-0 left-0 w-1 ${priorityColor} transition-all group-hover:w-1.5`}></div>

        <div className="p-3 pl-4">

          {/* HEADER: Checkbox & Title */}
          <div className="flex items-start gap-3 mb-2">
            <form
              action={async (formData) => {
                const taskId = formData.get('taskId');
                if (typeof taskId === 'string') {
                  await toggleTask(taskId, !task.is_completed);
                }
              }}
              className="mt-0.5"
            >
              <input type="hidden" name="taskId" value={task.id} />
              <button
                className="text-stone-300 hover:text-orange-500 transition-colors"
                title="Complete Task"
              >
                {task.is_completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </button>
            </form>

            <div className="flex-1 min-w-0">
              <EditableText
                id={task.id}
                initialText={task.title}
                type="task"
                className={`block text-sm font-medium leading-snug transition-all ${task.is_completed
                    ? 'text-stone-400 line-through decoration-stone-300'
                    : 'text-stone-700 dark:text-stone-200 group-hover:text-stone-900 dark:group-hover:text-white'
                  }`}
              />
            </div>

            {/* Hidden Actions (Reveal on Hover) */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2">
              <form action={deleteTask}>
                <input type="hidden" name="taskId" value={task.id} />
                <button className="p-1 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-red-500 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </form>
            </div>
          </div>

          {/* FOOTER: Metadata Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 1. Goal Pill (If linked) */}
            {task.goals?.title && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-[10px] font-medium text-stone-500 dark:text-stone-400 max-w-[120px]">
                <Target className="w-3 h-3 text-orange-400" />
                <span className="truncate">{task.goals.title}</span>
              </div>
            )}

            {/* 2. Duration Pill */}
            {(task.duration && task.duration > 0) && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-800 text-[10px] text-stone-400">
                <Clock className="w-3 h-3" />
                <span>{task.duration}m</span>
              </div>
            )}
          </div>

        </div>

        {/* Bottom "Thickness" (Simulates 3D Card) */}
        <div className="h-1 w-full bg-stone-100 dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700"></div>
      </div>
    </div>
  )
}