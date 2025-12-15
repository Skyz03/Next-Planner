'use client'

import { useDroppable } from '@dnd-kit/core'
import DraggableTask from './DraggableTask'
import { formatDate, isSameDay } from '@/utils/date'
import EditableText from '../../ui/EditableText'
import { deleteTask } from '@/actions/task' // <--- 1. Import Action

// Individual Column Component
function DayColumn({ day, tasks, isToday }: { day: Date; tasks: any[]; isToday: boolean }) {
  const dateStr = formatDate(day)
  const { setNodeRef, isOver } = useDroppable({
    id: `date-${dateStr}`,
    data: { date: dateStr },
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex h-full min-w-[200px] flex-1 flex-col border-r border-stone-200 transition-colors last:border-r-0 dark:border-stone-800 ${
        isOver ? 'bg-orange-50 dark:bg-orange-900/10' : ''
      }`}
    >
      {/* Column Header */}
      <div
        className={`border-b border-stone-100 p-4 text-center dark:border-stone-800 ${isToday ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}`}
      >
        <div className="text-[10px] font-bold tracking-wider text-stone-400 uppercase">
          {day.toLocaleDateString('en-US', { weekday: 'short' })}
        </div>
        <div
          className={`font-serif text-xl font-bold ${isToday ? 'text-orange-600' : 'text-stone-700 dark:text-stone-300'}`}
        >
          {day.getDate()}
        </div>
      </div>

      {/* Task List */}
      <div className="custom-scrollbar flex-1 space-y-2 overflow-y-auto p-2">
        {tasks.map((task) => (
          <DraggableTask key={task.id} task={task}>
            {/* 2. Update Card Styling to be 'relative' for absolute positioning of delete button */}
            <div className="group relative cursor-grab rounded-xl border border-stone-200 bg-white p-3 pr-6 text-left shadow-sm transition-all hover:border-orange-300 hover:shadow-md dark:border-stone-700 dark:bg-stone-800 dark:hover:border-orange-700">
              <EditableText
                id={task.id}
                initialText={task.title}
                type="task"
                className="line-clamp-2 text-xs font-medium text-stone-700 dark:text-stone-200"
              />

              {task.goals && (
                <div className="mt-2 flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-400"></div>
                  <span className="max-w-[120px] truncate text-[9px] tracking-wider text-stone-400 uppercase">
                    {task.goals.title}
                  </span>
                </div>
              )}

              {/* 3. The Delete Button (Hidden until hover) */}
              <form
                action={deleteTask}
                className="absolute top-1 right-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                // Stop propagation so clicking delete doesn't start a drag
                onPointerDown={(e) => e.stopPropagation()}
              >
                <input type="hidden" name="taskId" value={task.id} />
                <button
                  className="rounded-md p-1 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
                  title="Delete Task"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </form>
            </div>
          </DraggableTask>
        ))}
        {tasks.length === 0 && (
          <div className="flex h-full items-center justify-center opacity-0 transition-opacity hover:opacity-100">
            <span className="text-xs text-stone-300 italic">+ Drop here</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Main Grid Container
export default function PlanningGrid({
  weekDays,
  allTasks,
}: {
  weekDays: Date[]
  allTasks: any[]
}) {
  const today = new Date()

  return (
    <div className="h-full flex-1 overflow-x-auto overflow-y-hidden">
      <div className="flex h-full min-w-max">
        {weekDays.map((day) => {
          const dateStr = formatDate(day)
          // Filter tasks for this specific column
          const daysTasks = allTasks.filter((t) => t.due_date === dateStr)

          return (
            <DayColumn key={dateStr} day={day} tasks={daysTasks} isToday={isSameDay(day, today)} />
          )
        })}
      </div>
    </div>
  )
}
