'use client'

import { useDroppable } from '@dnd-kit/core'
import DraggableTask from './DraggableTask'
import { formatDate, isSameDay } from '@/utils/date'
import EditableText from '../../ui/EditableText'
import { deleteTask } from '@/actions/task' // <--- 1. Import Action

// Individual Column Component
function DayColumn({ day, tasks, isToday }: { day: Date, tasks: any[], isToday: boolean }) {
  const dateStr = formatDate(day)
  const { setNodeRef, isOver } = useDroppable({
    id: `date-${dateStr}`,
    data: { date: dateStr }
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-[200px] flex flex-col h-full border-r border-stone-200 dark:border-stone-800 last:border-r-0 transition-colors ${isOver ? 'bg-orange-50 dark:bg-orange-900/10' : ''
        }`}
    >
      {/* Column Header */}
      <div className={`p-4 border-b border-stone-100 dark:border-stone-800 text-center ${isToday ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}`}>
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
          {day.toLocaleDateString('en-US', { weekday: 'short' })}
        </div>
        <div className={`text-xl font-serif font-bold ${isToday ? 'text-orange-600' : 'text-stone-700 dark:text-stone-300'}`}>
          {day.getDate()}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
        {tasks.map(task => (
          <DraggableTask key={task.id} task={task}>
            {/* 2. Update Card Styling to be 'relative' for absolute positioning of delete button */}
            <div className="bg-white dark:bg-stone-800 p-3 pr-6 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700 cursor-grab text-left group relative transition-all">

              <EditableText
                id={task.id}
                initialText={task.title}
                type="task"
                className="text-xs font-medium text-stone-700 dark:text-stone-200 line-clamp-2"
              />

              {task.goals && (
                <div className="mt-2 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <span className="text-[9px] text-stone-400 uppercase tracking-wider truncate max-w-[120px]">
                    {task.goals.title}
                  </span>
                </div>
              )}

              {/* 3. The Delete Button (Hidden until hover) */}
              <form
                action={deleteTask}
                className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                // Stop propagation so clicking delete doesn't start a drag
                onPointerDown={(e) => e.stopPropagation()}
              >
                <input type="hidden" name="taskId" value={task.id} />
                <button
                  className="p-1 text-stone-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                  title="Delete Task"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </form>

            </div>
          </DraggableTask>
        ))}
        {tasks.length === 0 && (
          <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <span className="text-xs text-stone-300 italic">+ Drop here</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Main Grid Container
export default function PlanningGrid({ weekDays, allTasks }: { weekDays: Date[], allTasks: any[] }) {
  const today = new Date()

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden h-full">
      <div className="h-full flex min-w-max">
        {weekDays.map(day => {
          const dateStr = formatDate(day)
          // Filter tasks for this specific column
          const daysTasks = allTasks.filter(t => t.due_date === dateStr)

          return (
            <DayColumn
              key={dateStr}
              day={day}
              tasks={daysTasks}
              isToday={isSameDay(day, today)}
            />
          )
        })}
      </div>
    </div>
  )
}