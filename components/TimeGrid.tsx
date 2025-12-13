'use client'

import { useDroppable } from '@dnd-kit/core'
import DraggableTask from './DraggableTask'
import { useEffect, useState } from 'react'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5) // 5 AM to 10 PM
const PIXELS_PER_HOUR = 120 // Much taller for easier grabbing

export default function TimeGrid({ tasks }: { tasks: any[] }) {
    const [now, setNow] = useState<Date | null>(null)

    // Hydration-safe Current Time
    useEffect(() => {
        setNow(new Date())
        const interval = setInterval(() => setNow(new Date()), 60000)
        return () => clearInterval(interval)
    }, [])

    const scheduledTasks = tasks.filter(t => t.start_time)
    const unscheduledTasks = tasks.filter(t => !t.start_time)

    // Calculate "Now" line position
    let nowPosition = -1
    if (now) {
        const currentHour = now.getHours()
        const currentMin = now.getMinutes()
        if (currentHour >= 5 && currentHour <= 22) {
            nowPosition = ((currentHour - 5) * PIXELS_PER_HOUR) + ((currentMin / 60) * PIXELS_PER_HOUR)
        }
    }

    return (
        <div className="flex h-full relative">

            {/* 1. THE TIMELINE (Center Stage) */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#FAFAF9] dark:bg-[#1C1917] h-full">
                <div
                    className="absolute top-0 left-0 right-0 w-full p-4"
                    style={{ height: `${HOURS.length * PIXELS_PER_HOUR}px` }}
                >
                    {/* Background Grid */}
                    {HOURS.map(hour => (
                        <TimeSlot key={hour} time={`${hour}:00`} />
                    ))}

                    {/* Current Time Line */}
                    {nowPosition > 0 && (
                        <div className="absolute left-16 right-0 border-t-2 border-red-500 z-10 pointer-events-none" style={{ top: `${nowPosition}px` }}>
                            <div className="absolute -left-2 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                    )}

                    {/* Scheduled Tasks */}
                    {scheduledTasks.map(task => {
                        const [h, m] = task.start_time.split(':').map(Number)
                        const startHour = 5
                        const topPosition = ((h - startHour) * PIXELS_PER_HOUR) + ((m / 60) * PIXELS_PER_HOUR) + 16 // +16 padding
                        const height = Math.max((task.duration / 60) * PIXELS_PER_HOUR, 40) // Min height 40px

                        return (
                            <DraggableTask key={task.id} task={task}>
                                <div
                                    className="absolute left-20 right-4 rounded-xl bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-500 pl-3 py-2 text-xs hover:z-50 cursor-grab shadow-sm transition-transform hover:scale-[1.02]"
                                    style={{ top: `${topPosition}px`, height: `${height}px` }}
                                >
                                    <div className="font-bold text-orange-900 dark:text-orange-100 text-sm">{task.title}</div>
                                    <div className="text-orange-700 dark:text-orange-300/70 text-[10px] font-mono mt-0.5">
                                        {task.start_time.slice(0, 5)} • {task.duration}m
                                    </div>
                                </div>
                            </DraggableTask>
                        )
                    })}
                </div>
            </div>

            {/* 2. THE DOCK (Right Side - Today's Unscheduled) */}
            <div className="w-72 flex flex-col bg-white dark:bg-[#221F1D] border-l border-stone-200 dark:border-stone-800 shadow-xl z-20">
                <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
                    <h3 className="font-serif font-bold text-stone-700 dark:text-stone-200">Unscheduled</h3>
                    <p className="text-xs text-stone-400">Tasks for today.</p>
                </div>

                {/* Dock Drop Zone */}
                <DockDropZone>
                    <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                        {unscheduledTasks.map(task => (
                            <DraggableTask key={task.id} task={task}>
                                <div className="bg-white dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm hover:border-orange-400 cursor-grab active:cursor-grabbing group">
                                    <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{task.title}</span>
                                    {task.goals && (
                                        <div className="mt-2 text-[9px] uppercase tracking-wider text-stone-400">{task.goals.title}</div>
                                    )}
                                </div>
                            </DraggableTask>
                        ))}
                        {unscheduledTasks.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-40 text-stone-300">
                                <span className="text-xs italic">All scheduled</span>
                            </div>
                        )}
                    </div>
                </DockDropZone>
            </div>
        </div>
    )
}

// Visual Slot Component
function TimeSlot({ time }: { time: string }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `slot-${time}`,
        data: { time: time }
    })

    return (
        <div ref={setNodeRef} className="flex group relative" style={{ height: `${PIXELS_PER_HOUR}px` }}>
            {/* Time Label */}
            <div className="w-16 text-right pr-4 text-xs font-mono font-bold text-stone-400 -mt-2.5 select-none">
                {time}
            </div>
            {/* Grid Line */}
            <div className={`flex-1 border-t border-stone-200 dark:border-stone-800 ${isOver ? 'bg-orange-50 dark:bg-orange-900/20' : ''}`}>
                {/* 30min dashed line */}
                <div className="h-[50%] border-b border-stone-100 dark:border-stone-800/30 border-dashed"></div>
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
        <div ref={setNodeRef} className={`flex-1 flex flex-col overflow-hidden transition-colors ${isOver ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>
            {children}
        </div>
    )
}