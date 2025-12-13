'use client'

import { useDroppable } from '@dnd-kit/core'
import DraggableTask from './DraggableTask'
import EditableText from './EditableText'

// Helper to generate time slots (6 AM to 10 PM)
const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // [6, 7, ... 22]

export default function TimeGrid({ tasks }: { tasks: any[] }) {
  
  // Separation: Tasks with a time vs Tasks without
  const scheduledTasks = tasks.filter(t => t.start_time)
  const unscheduledTasks = tasks.filter(t => !t.start_time)

  return (
    <div className="flex h-full gap-6 overflow-hidden">
      
      {/* 1. THE DOCK (Unscheduled Tasks) */}
      <div className="w-80 flex flex-col bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800">
        <div className="p-4 border-b border-stone-100 dark:border-stone-800">
           <h3 className="font-serif font-bold text-stone-700 dark:text-stone-200">Task Dock</h3>
           <p className="text-xs text-stone-400">Drag to the timeline &rarr;</p>
        </div>
        
        {/* Make the Dock a Drop Zone (to unschedule) */}
        <DockDropZone>
          <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
            {unscheduledTasks.map(task => (
              <DraggableTask key={task.id} task={task}>
                <div className="bg-[#FAFAF9] dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm hover:border-orange-400 cursor-grab active:cursor-grabbing">
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{task.title}</span>
                </div>
              </DraggableTask>
            ))}
            {unscheduledTasks.length === 0 && (
               <div className="text-center py-10 opacity-40 text-xs italic">All clear!</div>
            )}
          </div>
        </DockDropZone>
      </div>

      {/* 2. THE TIMELINE (Time Tetris) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#FAFAF9] dark:bg-[#1C1917]">
         <div className="absolute top-0 left-0 right-0 h-[1000px] w-full p-4">
            
            {/* Render Background Grid Slots */}
            {HOURS.map(hour => {
               const timeLabel = `${hour}:00`
               // We format the ID so our Drop Handler knows the time: "slot-09:00"
               return (
                  <TimeSlot key={hour} time={timeLabel} />
               )
            })}

            {/* Render Scheduled Tasks (Absolute Positioning) */}
            {scheduledTasks.map(task => {
               // Calculate Position: (Hour - StartHour) * Height
               // Assuming each hour is 60px height + gap
               // Simplified logic for demo:
               const [h, m] = task.start_time.split(':').map(Number)
               const startHour = 6 // Grid starts at 6 AM
               const topPosition = ((h - startHour) * 80) + (m / 60 * 80) + 20 // 80px per hour
               const height = (task.duration / 60) * 80

               return (
                  <DraggableTask key={task.id} task={task}>
                     <div 
                        className="absolute left-20 right-4 rounded-lg bg-orange-100 dark:bg-orange-900/40 border-l-4 border-orange-500 p-2 text-xs hover:z-50 cursor-grab shadow-sm"
                        style={{ top: `${topPosition}px`, height: `${height}px` }}
                     >
                        <div className="font-bold text-orange-900 dark:text-orange-100">{task.start_time.slice(0,5)} - {task.title}</div>
                     </div>
                  </DraggableTask>
               )
            })}
         </div>
      </div>
    </div>
  )
}

// Sub-component: Individual Drop Zone Slot
function TimeSlot({ time }: { time: string }) {
   const { setNodeRef, isOver } = useDroppable({
      id: `slot-${time}`, // ID format: "slot-09:00"
      data: { time: time }
   })

   return (
      <div ref={setNodeRef} className="flex h-20 group relative">
         {/* Time Label */}
         <div className="w-16 text-right pr-4 text-xs font-mono text-stone-400 -mt-2.5">
            {time}
         </div>
         {/* Grid Line & Drop Zone */}
         <div className={`flex-1 border-t border-stone-200 dark:border-stone-800 ${isOver ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}>
             {/* Half-hour marker (visual only) */}
             <div className="h-10 border-b border-stone-100 dark:border-stone-800/50 border-dashed"></div>
         </div>
      </div>
   )
}

function DockDropZone({ children }: { children: React.ReactNode }) {
   const { setNodeRef, isOver } = useDroppable({
      id: 'dock',
      data: { type: 'dock' }
   })
   return (
      <div ref={setNodeRef} className={`flex-1 flex flex-col overflow-hidden transition-colors ${isOver ? 'bg-stone-50 dark:bg-stone-800/50' : ''}`}>
         {children}
      </div>
   )
}
