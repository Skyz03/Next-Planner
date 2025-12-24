'use client'

import DroppableDay from './DroppableDay'
import DraggableTask from './DraggableTask'
import TaskItem from './TaskItem'
import { ArrowRight, CalendarClock } from 'lucide-react'

export default function PlanningGrid({
  weekDays,
  allTasks,
  nextWeekTasks = [],
  nextMondayStr,
}: {
  weekDays: Date[]
  allTasks: any[]
  nextWeekTasks?: any[]
  nextMondayStr: string
}) {
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const safeNextWeekTasks = nextWeekTasks || [] 

  return (
    <div className="h-full w-full overflow-x-auto overflow-y-hidden custom-scrollbar bg-[#F5F5F4] dark:bg-[#121212]">
      <div className="flex h-full min-w-max p-8 gap-6">

        {/* --- STANDARD WEEK COLUMNS --- */}
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
              {/* Day Header */}
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

              {/* Tasks List */}
              <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar space-y-3">
                {dayTasks.map((task) => (
                  <DraggableTask key={task.id} task={task}>
                    <TaskItem task={task} />
                  </DraggableTask>
                ))}
                {/* Empty Drop Zone */}
                <div className="h-12 w-full transition-all group-hover:h-24"></div>
              </div>
            </DroppableDay>
          )
        })}

        {/* --- 🆕 THE "NEXT WEEK" QUEUE --- */}
        <div className="flex items-center justify-center">
          <div className="h-full w-px bg-stone-300 dark:bg-stone-800/50 mx-2"></div>
        </div>

        <DroppableDay
          dateStr={nextMondayStr} // Dropping here sets date to Next Monday
          className="group relative flex h-full w-80 flex-col rounded-3xl border-2 border-dashed border-stone-200 bg-stone-50/50 dark:bg-[#151515] dark:border-stone-800/50"
        >
          <div className="flex-none p-5 pb-2 opacity-60 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 mb-2 text-stone-500">
              <CalendarClock className="w-5 h-5" />
              <span className="text-sm font-bold uppercase tracking-widest">The Queue</span>
            </div>
            <h3 className="font-serif text-xl font-bold text-stone-400 dark:text-stone-500 leading-tight">
              Next Week <br /> & Beyond
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar space-y-3">
            {/* Show items already in the queue */}
            {safeNextWeekTasks.map((task) => (
              <DraggableTask key={task.id} task={task}>
                {/* We render them slightly simpler/transparent to indicate "Future" */}
                <div className="opacity-80 hover:opacity-100 transition-opacity">
                  <TaskItem task={task} />
                </div>
              </DraggableTask>
            ))}

            {safeNextWeekTasks.length === 0 && (
              <div className="mt-8 text-center px-4">
                <p className="text-xs text-stone-400 leading-relaxed">
                  Drag tasks here to push them to next week. They will appear on Monday.
                </p>
              </div>
            )}
            <div className="h-24 w-full"></div>
          </div>
        </DroppableDay>

      </div>
    </div>
  )
}