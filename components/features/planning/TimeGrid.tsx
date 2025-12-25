'use client'

import { useDroppable } from '@dnd-kit/core'
import DraggableTask from './DraggableTask'
import { useEffect, useState, useRef, useOptimistic, startTransition } from 'react'
import { scheduleTaskTime, toggleTask } from '@/actions/task'
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
      return state.map((t) => (t.id === taskId ? { ...t, is_completed: isCompleted } : t))
    },
  )

  useEffect(() => {
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 60000)
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setSelectedSlot(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      clearInterval(interval)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const scheduledTasks = optimisticTasks.filter((t) => t.start_time)
  const unscheduledTasks = optimisticTasks.filter((t) => !t.start_time && !t.is_completed)

  let nowPosition = -1
  if (now) {
    const currentHour = now.getHours()
    const currentMin = now.getMinutes()
    if (currentHour >= 5 && currentHour <= 22) {
      nowPosition = (currentHour - 5) * PIXELS_PER_HOUR + (currentMin / 60) * PIXELS_PER_HOUR
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
    <div className="group/container relative flex h-full">
      {/* 1. TIMELINE */}
      <div className="custom-scrollbar relative h-full flex-1 overflow-y-auto bg-[#FAFAF9] dark:bg-[#1C1917]">
        <div
          className="absolute top-0 right-0 left-0 w-full p-4"
          style={{ height: `${HOURS.length * PIXELS_PER_HOUR}px` }}
        >
          {HOURS.map((hour) => {
            const timeLabel = `${hour < 10 ? '0' + hour : hour}:00`
            return (
              <TimeSlot key={hour} time={timeLabel} onClick={() => setSelectedSlot(timeLabel)} />
            )
          })}

          {nowPosition > 0 && (
            <div
              className="pointer-events-none absolute right-0 left-16 z-10 border-t-2 border-red-500"
              style={{ top: `${nowPosition}px` }}
            >
              <div className="absolute -top-1.5 -left-2 h-3 w-3 rounded-full bg-red-500"></div>
            </div>
          )}

          {scheduledTasks.map((task) => {
            const [h, m] = task.start_time.split(':').map(Number)
            const startHour = 5
            const topPosition = (h - startHour) * PIXELS_PER_HOUR + (m / 60) * PIXELS_PER_HOUR + 16
            const height = Math.max((task.duration / 60) * PIXELS_PER_HOUR, 80) // Min height 80px for controls
            const isDone = task.is_completed
            const isRunning = !!task.last_started_at

            return (
              <DraggableTask key={task.id} task={task} className="absolute right-4 left-20 z-10" style={{ top: `${topPosition}px`, height: `${height}px` }} >
                <div
                  className={`group/card absolute right-4 left-20 flex cursor-grab flex-col justify-between rounded-xl border p-3 text-xs shadow-sm transition-all hover:z-30 hover:scale-[1.01] ${isDone
                    ? 'border-stone-200 bg-stone-50 opacity-60 dark:bg-stone-800'
                    : isRunning
                      ? 'z-20 border-orange-500 bg-white shadow-lg ring-1 shadow-orange-500/10 ring-orange-500/20 dark:bg-[#262626]'
                      : 'border-stone-200 bg-white hover:border-orange-300 dark:border-stone-700 dark:bg-[#262626]'
                    } `}
                >
                  {/* TOP ROW: Title & Unschedule */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div
                        className={`text-sm leading-tight font-bold ${isDone ? 'text-stone-400 line-through' : 'text-stone-800 dark:text-stone-100'}`}
                      >
                        {task.title}
                      </div>
                      <div className="mt-1 font-mono text-[10px] text-stone-400">
                        {task.start_time.slice(0, 5)}
                      </div>
                    </div>

                    {/* Unschedule X (Always visible but subtle) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        unschedule(task.id)
                      }}
                      className="rounded-md p-1.5 text-stone-300 transition-colors hover:bg-stone-100 hover:text-red-500 dark:hover:bg-stone-800"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  {/* BOTTOM ROW: Controls (Timer + Checkbox) */}
                  {/* Only show controls if task is NOT done (or allow unchecking) */}
                  <div className="mt-2 flex items-center justify-between border-t border-stone-100 pt-2 dark:border-stone-800">
                    {/* Timer Component (Left) */}
                    <div className={isDone ? 'pointer-events-none opacity-0' : 'opacity-100'}>
                      <TaskTimer task={task} />
                    </div>

                    {/* Checkbox (Right - Big & Easy to hit) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleToggle(task.id, isDone)
                      }}
                      className={`flex h-7 items-center gap-1.5 rounded-md border px-3 text-xs font-bold transition-all ${isDone
                        ? 'border-green-200 bg-green-100 text-green-700 hover:bg-green-200'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-green-500 hover:text-green-600'
                        }`}
                    >
                      {isDone ? (
                        <>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Done</span>
                        </>
                      ) : (
                        <>
                          <div className="h-3 w-3 rounded border border-stone-300"></div>
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
              className="animate-in fade-in zoom-in-95 absolute right-10 left-24 z-50 rounded-xl border border-stone-200 bg-white shadow-2xl duration-100 dark:border-stone-700 dark:bg-stone-800"
              style={{
                top: `${(parseInt(selectedSlot.split(':')[0]) - 5) * PIXELS_PER_HOUR + 20}px`,
              }}
            >
              {/* ... picker content same as before ... */}
              <div className="flex items-center justify-between rounded-t-xl border-b border-stone-100 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-900/50">
                <span className="text-xs font-bold tracking-wider text-stone-500 uppercase">
                  Schedule for {selectedSlot}
                </span>
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="text-stone-400 hover:text-stone-600"
                >
                  ✕
                </button>
              </div>
              <div className="custom-scrollbar max-h-60 overflow-y-auto p-2">
                {unscheduledTasks.length === 0 ? (
                  <div className="p-4 text-center text-xs text-stone-400 italic">
                    No unscheduled tasks available.
                  </div>
                ) : (
                  unscheduledTasks.map((task) => (
                    <button
                      key={task.id}
                      onClick={() => quickSchedule(task.id)}
                      className="group flex w-full items-center justify-between rounded-lg p-3 text-left transition-colors hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    >
                      <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                        {task.title}
                      </span>
                      <span className="text-[10px] font-bold text-stone-400 opacity-0 transition-opacity group-hover:text-orange-500 group-hover:opacity-100">
                        Select
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. DOCK */}
      <div className="z-20 flex w-72 flex-col border-l border-stone-200 bg-white shadow-xl dark:border-stone-800 dark:bg-[#221F1D]">
        <div className="border-b border-stone-100 bg-stone-50/50 p-4 dark:border-stone-800 dark:bg-stone-900/50">
          <h3 className="font-serif font-bold text-stone-700 dark:text-stone-200">Unscheduled</h3>
          <p className="text-xs text-stone-400">Tasks for today.</p>
        </div>
        <DockDropZone>
          <div className="custom-scrollbar flex-1 space-y-3 overflow-y-auto p-3">
            {unscheduledTasks.map((task) => (
              <DraggableTask key={task.id} task={task}>
                <div className="group cursor-grab rounded-xl border border-stone-200 bg-white p-4 shadow-sm hover:border-orange-400 active:cursor-grabbing dark:border-stone-700 dark:bg-stone-800">
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-200">
                    {task.title}
                  </span>
                </div>
              </DraggableTask>
            ))}
            {unscheduledTasks.length === 0 && (
              <div className="flex h-40 flex-col items-center justify-center text-stone-300">
                <span className="text-xs italic">All scheduled</span>
              </div>
            )}
          </div>
        </DockDropZone>
      </div>
    </div>
  )
}

function TimeSlot({ time, onClick }: { time: string; onClick: () => void }) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${time}`, data: { time: time } })
  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className="group relative flex cursor-pointer"
      style={{ height: `${PIXELS_PER_HOUR}px` }}
    >
      <div className="pointer-events-none -mt-2.5 w-16 pr-4 text-right font-mono text-xs font-bold text-stone-400 select-none">
        {time}
      </div>
      <div
        className={`flex-1 border-t border-stone-200 transition-colors dark:border-stone-800 ${isOver ? 'bg-orange-50 dark:bg-orange-900/20' : 'group-hover:bg-stone-50 dark:group-hover:bg-white/5'}`}
      >
        <div className="pointer-events-none h-[50%] border-b border-dashed border-stone-100 dark:border-stone-800/30"></div>
        <div className="hidden h-full items-center justify-center opacity-30 group-hover:flex">
          <span className="text-[10px] font-bold text-stone-400 uppercase">+ Schedule Here</span>
        </div>
      </div>
    </div>
  )
}

function DockDropZone({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'dock', data: { type: 'dock' } })
  return (
    <div
      ref={setNodeRef}
      className={`flex flex-1 flex-col overflow-hidden transition-colors ${isOver ? 'bg-orange-50 dark:bg-orange-900/10' : ''}`}
    >
      {children}
    </div>
  )
}