'use client'

import { useDroppable } from '@dnd-kit/core'
import DraggableTask from './DraggableTask'
import { useEffect, useState, useRef } from 'react'
import { scheduleTaskTime } from '@/app/actions' // Ensure this action is imported

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5) // 5 AM to 10 PM
const PIXELS_PER_HOUR = 120

export default function TimeGrid({ tasks }: { tasks: any[] }) {
    const [now, setNow] = useState<Date | null>(null)
    // State to track which time slot is currently being clicked
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setNow(new Date())
        const interval = setInterval(() => setNow(new Date()), 60000)

        // Click outside to close menu
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setSelectedSlot(null)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            clearInterval(interval)
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    const scheduledTasks = tasks.filter(t => t.start_time)
    const unscheduledTasks = tasks.filter(t => !t.start_time)

    // Current time line calculation
    let nowPosition = -1
    if (now) {
        const currentHour = now.getHours()
        const currentMin = now.getMinutes()
        if (currentHour >= 5 && currentHour <= 22) {
            nowPosition = ((currentHour - 5) * PIXELS_PER_HOUR) + ((currentMin / 60) * PIXELS_PER_HOUR)
        }
    }

    // Action: Assign task to selected slot
    async function quickSchedule(taskId: string) {
        if (!selectedSlot) return
        // Optimistic UI update could go here
        await scheduleTaskTime(taskId, selectedSlot, 60)
        setSelectedSlot(null)
    }

    // Action: Remove time (Back to Dock)
    async function unschedule(taskId: string) {
        await scheduleTaskTime(taskId, null)
    }

    return (
        <div className="flex h-full relative group/container">

            {/* 1. THE TIMELINE */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#FAFAF9] dark:bg-[#1C1917] h-full">
                <div
                    className="absolute top-0 left-0 right-0 w-full p-4"
                    style={{ height: `${HOURS.length * PIXELS_PER_HOUR}px` }}
                >
                    {/* Background Grid */}
                    {HOURS.map(hour => {
                        const timeLabel = `${hour < 10 ? '0' + hour : hour}:00`
                        return (
                            <TimeSlot
                                key={hour}
                                time={timeLabel}
                                onClick={() => setSelectedSlot(timeLabel)}
                            />
                        )
                    })}

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
                        const topPosition = ((h - startHour) * PIXELS_PER_HOUR) + ((m / 60) * PIXELS_PER_HOUR) + 16
                        const height = Math.max((task.duration / 60) * PIXELS_PER_HOUR, 40)

                        return (
                            <DraggableTask key={task.id} task={task}>
                                <div
                                    className="absolute left-20 right-4 rounded-xl bg-orange-100 dark:bg-orange-900/30 border-l-4 border-orange-500 pl-3 py-2 text-xs hover:z-30 cursor-grab shadow-sm transition-transform hover:scale-[1.01] group/card"
                                    style={{ top: `${topPosition}px`, height: `${height}px` }}
                                >
                                    <div className="font-bold text-orange-900 dark:text-orange-100 text-sm truncate pr-6">{task.title}</div>
                                    <div className="text-orange-700 dark:text-orange-300/70 text-[10px] font-mono mt-0.5">
                                        {task.start_time.slice(0, 5)} • {task.duration}m
                                    </div>

                                    {/* 👇 UNSCHEDULE BUTTON (Visible on Hover) */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation() // Prevent drag start
                                            unschedule(task.id)
                                        }}
                                        className="absolute top-1 right-1 p-1 text-orange-400 hover:text-red-500 hover:bg-white/50 rounded opacity-0 group-hover/card:opacity-100 transition-opacity"
                                        title="Unschedule (Move back to dock)"
                                    >
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                    </button>
                                </div>
                            </DraggableTask>
                        )
                    })}

                    {/* 👇 QUICK PICKER MENU (Popover) */}
                    {selectedSlot && (
                        <div
                            ref={menuRef}
                            className="absolute left-24 right-10 z-50 bg-white dark:bg-stone-800 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 animate-in fade-in zoom-in-95 duration-100"
                            // Calculate top position based on the selected slot time
                            style={{
                                top: `${((parseInt(selectedSlot.split(':')[0]) - 5) * PIXELS_PER_HOUR) + 20}px`
                            }}
                        >
                            <div className="p-3 border-b border-stone-100 dark:border-stone-700 bg-stone-50 dark:bg-stone-900/50 rounded-t-xl flex justify-between items-center">
                                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">Schedule for {selectedSlot}</span>
                                <button onClick={() => setSelectedSlot(null)} className="text-stone-400 hover:text-stone-600">✕</button>
                            </div>

                            <div className="max-h-60 overflow-y-auto p-2 custom-scrollbar">
                                {unscheduledTasks.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-stone-400 italic">No unscheduled tasks available.</div>
                                ) : (
                                    unscheduledTasks.map(task => (
                                        <button
                                            key={task.id}
                                            onClick={() => quickSchedule(task.id)}
                                            className="w-full text-left p-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg group flex items-center justify-between transition-colors"
                                        >
                                            <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{task.title}</span>
                                            <span className="text-[10px] text-stone-400 group-hover:text-orange-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">Select</span>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. THE DOCK (Right Side) */}
            <div className="w-72 flex flex-col bg-white dark:bg-[#221F1D] border-l border-stone-200 dark:border-stone-800 shadow-xl z-20">
                <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50">
                    <h3 className="font-serif font-bold text-stone-700 dark:text-stone-200">Unscheduled</h3>
                    <p className="text-xs text-stone-400">Tasks for today.</p>
                </div>

                <DockDropZone>
                    <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                        {unscheduledTasks.map(task => (
                            <DraggableTask key={task.id} task={task}>
                                <div className="bg-white dark:bg-stone-800 p-4 rounded-xl border border-stone-200 dark:border-stone-700 shadow-sm hover:border-orange-400 cursor-grab active:cursor-grabbing group">
                                    <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{task.title}</span>
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

function TimeSlot({ time, onClick }: { time: string, onClick: () => void }) {
    const { setNodeRef, isOver } = useDroppable({
        id: `slot-${time}`,
        data: { time: time }
    })

    return (
        <div
            ref={setNodeRef}
            onClick={onClick} // 👈 Click to open menu
            className="flex group relative cursor-pointer"
            style={{ height: `${PIXELS_PER_HOUR}px` }}
        >
            {/* Time Label */}
            <div className="w-16 text-right pr-4 text-xs font-mono font-bold text-stone-400 -mt-2.5 select-none pointer-events-none">
                {time}
            </div>
            {/* Grid Line */}
            <div className={`flex-1 border-t border-stone-200 dark:border-stone-800 transition-colors ${isOver ? 'bg-orange-50 dark:bg-orange-900/20' : 'group-hover:bg-stone-50 dark:group-hover:bg-white/5'}`}>
                {/* 30min dashed line */}
                <div className="h-[50%] border-b border-stone-100 dark:border-stone-800/30 border-dashed pointer-events-none"></div>

                {/* Hover Hint */}
                <div className="hidden group-hover:flex h-full items-center justify-center opacity-30">
                    <span className="text-[10px] uppercase font-bold text-stone-400">+ Schedule Here</span>
                </div>
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