'use client'

import { useDroppable } from '@dnd-kit/core'
import DraggableTask from './DraggableTask'
import { useEffect, useState, useRef, useOptimistic, startTransition } from 'react'
import { scheduleTaskTime, toggleTask } from '@/app/actions'
import TaskTimer from './TaskTimer'

const HOURS = Array.from({ length: 18 }, (_, i) => i + 5) // 5 AM to 10 PM
const PIXELS_PER_HOUR = 140 // Increased height for better UI spacing

export default function TimeGrid({ tasks }: { tasks: any[] }) {
    const [now, setNow] = useState<Date | null>(null)
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
    const menuRef = useRef<HTMLDivElement>(null)

    const [optimisticTasks, setOptimisticTask] = useOptimistic(
        tasks,
        (state, { taskId, isCompleted }: { taskId: string; isCompleted: boolean }) => {
            return state.map((t) =>
                t.id === taskId ? { ...t, is_completed: isCompleted } : t
            )
        }
    )

    useEffect(() => {
        setNow(new Date())
        const interval = setInterval(() => setNow(new Date()), 60000)
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

    const scheduledTasks = optimisticTasks.filter(t => t.start_time)
    const unscheduledTasks = optimisticTasks.filter(t => !t.start_time && !t.is_completed)

    let nowPosition = -1
    if (now) {
        const currentHour = now.getHours()
        const currentMin = now.getMinutes()
        if (currentHour >= 5 && currentHour <= 22) {
            nowPosition = ((currentHour - 5) * PIXELS_PER_HOUR) + ((currentMin / 60) * PIXELS_PER_HOUR)
        }
    }

    async function quickSchedule(taskId: string) {
        if (!selectedSlot) return
        await scheduleTaskTime(taskId, selectedSlot, 60)
        setSelectedSlot(null)
    }

    async function unschedule(taskId: string) {
        await scheduleTaskTime(taskId, null)
    }

    function handleToggle(taskId: string, currentStatus: boolean) {
        const newStatus = !currentStatus
        startTransition(() => {
            setOptimisticTask({ taskId, isCompleted: newStatus })
        })
        toggleTask(taskId, newStatus)
    }

    return (
        <div className="flex h-full relative group/container">

            {/* 1. TIMELINE */}
            <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#FAFAF9] dark:bg-[#1C1917] h-full">
                <div className="absolute top-0 left-0 right-0 w-full p-4" style={{ height: `${HOURS.length * PIXELS_PER_HOUR}px` }}>
                    {HOURS.map(hour => {
                        const timeLabel = `${hour < 10 ? '0' + hour : hour}:00`
                        return <TimeSlot key={hour} time={timeLabel} onClick={() => setSelectedSlot(timeLabel)} />
                    })}

                    {nowPosition > 0 && (
                        <div className="absolute left-16 right-0 border-t-2 border-red-500 z-10 pointer-events-none" style={{ top: `${nowPosition}px` }}>
                            <div className="absolute -left-2 -top-1.5 w-3 h-3 bg-red-500 rounded-full"></div>
                        </div>
                    )}

                    {scheduledTasks.map(task => {
                        const [h, m] = task.start_time.split(':').map(Number)
                        const startHour = 5
                        const topPosition = ((h - startHour) * PIXELS_PER_HOUR) + ((m / 60) * PIXELS_PER_HOUR) + 16
                        const height = Math.max((task.duration / 60) * PIXELS_PER_HOUR, 80) // Min height 80px for controls
                        const isDone = task.is_completed
                        const isRunning = !!task.last_started_at

                        return (
                            <DraggableTask key={task.id} task={task}>
                                <div
                                    className={`absolute left-20 right-4 rounded-xl border flex flex-col justify-between p-3 text-xs hover:z-30 cursor-grab shadow-sm transition-all hover:scale-[1.01] group/card
                          ${isDone
                                            ? 'bg-stone-50 dark:bg-stone-800 border-stone-200 opacity-60'
                                            : isRunning
                                                ? 'bg-white dark:bg-[#262626] border-orange-500 ring-1 ring-orange-500/20 shadow-lg shadow-orange-500/10 z-20'
                                                : 'bg-white dark:bg-[#262626] border-stone-200 dark:border-stone-700 hover:border-orange-300'
                                        }
                        `}
                                    style={{ top: `${topPosition}px`, height: `${height}px` }}
                                >
                                    {/* TOP ROW: Title & Unschedule */}
                                    <div className="flex justify-between items-start gap-2">
                                        <div>
                                            <div className={`font-bold text-sm leading-tight ${isDone ? 'text-stone-400 line-through' : 'text-stone-800 dark:text-stone-100'}`}>
                                                {task.title}
                                            </div>
                                            <div className="text-[10px] font-mono text-stone-400 mt-1">
                                                {task.start_time.slice(0, 5)}
                                            </div>
                                        </div>

                                        {/* Unschedule X (Always visible but subtle) */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); unschedule(task.id) }}
                                            className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors"
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                    </div>

                                    {/* BOTTOM ROW: Controls (Timer + Checkbox) */}
                                    {/* Only show controls if task is NOT done (or allow unchecking) */}
                                    <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-stone-800 mt-2">

                                        {/* Timer Component (Left) */}
                                        <div className={isDone ? 'opacity-0 pointer-events-none' : 'opacity-100'}>
                                            <TaskTimer task={task} />
                                        </div>

                                        {/* Checkbox (Right - Big & Easy to hit) */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleToggle(task.id, isDone) }}
                                            className={`h-7 px-3 rounded-md border text-xs font-bold flex items-center gap-1.5 transition-all ${isDone
                                                    ? 'bg-green-100 border-green-200 text-green-700 hover:bg-green-200'
                                                    : 'bg-white border-stone-200 text-stone-600 hover:border-green-500 hover:text-green-600'
                                                }`}
                                        >
                                            {isDone ? (
                                                <>
                                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                                    <span>Done</span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-3 h-3 rounded border border-stone-300"></div>
                                                    <span>Mark Done</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </DraggableTask>
                        )
                    })}

                    {/* ... Keep Quick Picker Logic ... */}
                    {selectedSlot && (
                        <div
                            ref={menuRef}
                            className="absolute left-24 right-10 z-50 bg-white dark:bg-stone-800 rounded-xl shadow-2xl border border-stone-200 dark:border-stone-700 animate-in fade-in zoom-in-95 duration-100"
                            style={{ top: `${((parseInt(selectedSlot.split(':')[0]) - 5) * PIXELS_PER_HOUR) + 20}px` }}
                        >
                            {/* ... picker content same as before ... */}
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

            {/* 2. DOCK */}
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
    const { setNodeRef, isOver } = useDroppable({ id: `slot-${time}`, data: { time: time } })
    return (
        <div ref={setNodeRef} onClick={onClick} className="flex group relative cursor-pointer" style={{ height: `${PIXELS_PER_HOUR}px` }}>
            <div className="w-16 text-right pr-4 text-xs font-mono font-bold text-stone-400 -mt-2.5 select-none pointer-events-none">{time}</div>
            <div className={`flex-1 border-t border-stone-200 dark:border-stone-800 transition-colors ${isOver ? 'bg-orange-50 dark:bg-orange-900/20' : 'group-hover:bg-stone-50 dark:group-hover:bg-white/5'}`}>
                <div className="h-[50%] border-b border-stone-100 dark:border-stone-800/30 border-dashed pointer-events-none"></div>
                <div className="hidden group-hover:flex h-full items-center justify-center opacity-30">
                    <span className="text-[10px] uppercase font-bold text-stone-400">+ Schedule Here</span>
                </div>
            </div>
        </div>
    )
}

function DockDropZone({ children }: { children: React.ReactNode }) {
    const { setNodeRef, isOver } = useDroppable({ id: 'dock', data: { type: 'dock' } })
    return <div ref={setNodeRef} className={`flex-1 flex flex-col overflow-hidden transition-colors ${isOver ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}>{children}</div>
}