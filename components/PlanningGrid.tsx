'use client'

import { useDroppable } from '@dnd-kit/core'
import DraggableTask from './DraggableTask' // Reuse your draggable wrapper
import { formatDate, isSameDay } from '@/utils/date'

// Individual Column Component
function DayColumn({ day, tasks, isToday }: { day: Date, tasks: any[], isToday: boolean }) {
  const dateStr = formatDate(day)
  const { setNodeRef, isOver } = useDroppable({
    id: `date-${dateStr}`, // Same ID format as your WeekStrip
    data: { date: dateStr }
  })

  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 min-w-[200px] flex flex-col h-full border-r border-stone-200 dark:border-stone-800 last:border-r-0 transition-colors ${
        isOver ? 'bg-orange-50 dark:bg-orange-900/10' : ''
      }`}
    >
      {/* Column Header */}
      <div className={`p-3 border-b border-stone-100 dark:border-stone-800 text-center ${isToday ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''}`}>
        <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
          {day.toLocaleDateString('en-US', { weekday: 'short' })}
        </div>
        <div className={`text-lg font-serif font-bold ${isToday ? 'text-orange-600' : 'text-stone-700 dark:text-stone-300'}`}>
          {day.getDate()}
        </div>
      </div>

      {/* Task List */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
        {tasks.map(task => (
          <DraggableTask key={task.id} task={task}>
            <div className="bg-white dark:bg-stone-800 p-3 rounded-lg border border-stone-200 dark:border-stone-700 shadow-sm hover:shadow-md hover:border-orange-300 cursor-grab text-left group">
              <p className="text-xs font-medium text-stone-700 dark:text-stone-200 line-clamp-2">
                {task.title}
              </p>
              {task.goals && (
                <div className="mt-2 flex items-center gap-1">
                   <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                   <span className="text-[9px] text-stone-400 uppercase tracking-wider truncate">
                     {task.goals.title}
                   </span>
                </div>
              )}
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
    <div className="flex-1 overflow-x-auto overflow-y-hidden">
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