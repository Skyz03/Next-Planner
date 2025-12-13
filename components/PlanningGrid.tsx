'use client'

import DraggableTask from '@/components/DraggableTask'
import DroppableDay from './DroppableDay'
import { formatDate, isSameDay } from '@/utils/date'
import EditableText from './EditableText'

export default function PlanningGrid({ weekDays, allTasks }: { weekDays: Date[], allTasks: any[] }) {
  const today = new Date()

  return (
    <div className="flex-1 overflow-x-auto h-full p-6">
       <div className="flex h-full gap-4 min-w-[1000px]">
         {weekDays.map(day => {
           const dateStr = formatDate(day)
           const daysTasks = allTasks.filter(t => t.due_date === dateStr)
           const isToday = isSameDay(day, today)
           
           return (
             <DroppableDay 
               key={dateStr} 
               dateStr={dateStr}
               className={`flex-1 min-w-[200px] flex flex-col rounded-2xl bg-white dark:bg-[#221F1D] border border-stone-200 dark:border-stone-800 shadow-sm`}
             >
                {/* Header */}
                <div className={`p-4 border-b border-stone-100 dark:border-stone-800 ${isToday ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-xl font-serif font-bold ${isToday ? 'text-orange-600' : 'text-stone-700 dark:text-stone-300'}`}>
                    {day.getDate()}
                  </div>
                </div>

                {/* Task List */}
                <div className="flex-1 p-2 space-y-2 overflow-y-auto custom-scrollbar">
                  {daysTasks.map(task => (
                    <DraggableTask key={task.id} task={task}>
                      <div className="bg-[#FAFAF9] dark:bg-stone-800 p-3 rounded-xl border border-stone-100 dark:border-stone-700 shadow-sm hover:shadow-md hover:border-orange-200 dark:hover:border-orange-900 cursor-grab group">
                        <EditableText id={task.id} initialText={task.title} type="task" className="text-xs font-medium text-stone-700 dark:text-stone-200" />
                        
                        {task.goals && (
                          <div className="mt-2 inline-flex items-center px-1.5 py-0.5 rounded bg-stone-100 dark:bg-stone-700">
                             <span className="text-[9px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider max-w-[120px] truncate">
                               {task.goals.title}
                             </span>
                          </div>
                        )}
                      </div>
                    </DraggableTask>
                  ))}
                  
                  {/* Empty State Hint */}
                  {daysTasks.length === 0 && (
                     <div className="h-20 flex items-center justify-center border-2 border-dashed border-stone-100 dark:border-stone-800 rounded-xl m-2 opacity-50">
                        <span className="text-[10px] text-stone-400">Drop here</span>
                     </div>
                  )}
                </div>
             </DroppableDay>
           )
         })}
       </div>
    </div>
  )
}