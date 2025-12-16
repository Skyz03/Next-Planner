'use client'

import DroppableDay from './DroppableDay'
import DraggableTask from './DraggableTask'
import TaskItem from './TaskItem'

export default function PlanningGrid({
  weekDays,
  allTasks,
}: {
  weekDays: Date[]
  allTasks: any[]
}) {
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-hidden custom-scrollbar bg-[#F5F5F4] dark:bg-[#121212]">
      {/* THE GRID LAYOUT 
         Added gap-6 for breathing room.
         Added min-w to ensure columns don't crush on small screens.
      */}
      <div className="flex h-full min-w-max p-8 gap-6">

        {weekDays.map((day) => {
          const dateStr = formatDate(day)
          const isToday = formatDate(new Date()) === dateStr
          const dayTasks = allTasks.filter((t) => t.due_date === dateStr)

          // Total Estimated Time
          const totalMinutes = dayTasks.reduce((acc, t) => acc + (t.duration || 0), 0)
          const hours = Math.floor(totalMinutes / 60)
          const mins = totalMinutes % 60
          const timeLabel = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`

          return (
            <DroppableDay
              key={dateStr}
              dateStr={dateStr}
              className={`
                group relative flex h-full w-80 flex-col rounded-3xl border transition-colors duration-300
                ${isToday
                  ? 'bg-white dark:bg-[#1C1917] border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/50 dark:shadow-black/50'
                  : 'bg-stone-100/50 dark:bg-[#18181b] border-transparent hover:border-stone-200 dark:hover:border-stone-800'
                }
              `}
            >
              {/* DAY HEADER */}
              <div className="flex-none p-5 pb-2">
                <div className="flex items-end justify-between mb-1">
                  <span className={`text-sm font-bold uppercase tracking-widest ${isToday ? 'text-orange-500' : 'text-stone-400'}`}>
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-mono text-stone-400 bg-stone-200 dark:bg-stone-800 px-1.5 py-0.5 rounded">
                      {timeLabel}
                    </span>
                  )}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className={`font-serif text-3xl font-bold ${isToday ? 'text-stone-900 dark:text-white' : 'text-stone-400 dark:text-stone-600'}`}>
                    {day.getDate()}
                  </span>
                </div>
              </div>

              {/* TASKS CONTAINER (Scrollable within the day) */}
              <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar space-y-3">
                {dayTasks.map((task) => (
                  <DraggableTask key={task.id} task={task}>
                    <TaskItem task={task} />
                  </DraggableTask>
                ))}

                {/* Empty State / Drop Target Area */}
                {dayTasks.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-xl flex items-center justify-center">
                    <span className="text-xs text-stone-400 font-medium">Drop plan here</span>
                  </div>
                )}

                {/* Bottom spacer for easy dropping at end of list */}
                <div className="h-12 w-full transition-all group-hover:h-24"></div>
              </div>
            </DroppableDay>
          )
        })}
      </div>
    </div>
  )
}