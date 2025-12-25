'use client'

import { DndContext, DragEndEvent, useSensors, useSensor, PointerSensor } from '@dnd-kit/core'
import { moveTaskToDate, scheduleTaskTime } from '@/actions/task'
import { useTransition, useId } from 'react' // <--- 1. Import useId

export default function PlannerBoard({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition()

  // 2. Generate a stable ID (or you can just use a string like id="planner-board")
  const id = useId()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const taskId = active.data.current?.taskId
    const overId = String(over.id)

    if (overId.startsWith('slot-')) {
      const timeStr = over.data.current?.time // "09:00"
      // Default 60 mins duration
      await scheduleTaskTime(taskId, timeStr, 60)
    }

    // 2. Dropped on DOCK (Unschedule time, keep date)
    else if (overId === 'dock') {
      await scheduleTaskTime(taskId, null)
    }

    // 3. Dropped on DATE (Your previous logic)
    else if (over.data.current?.date) {
      const dateStr = over.data.current?.date
      await moveTaskToDate(taskId, dateStr)
    }

    // 4. Dropped on BACKLOG SIDEBAR
    else if (overId.includes('backlog')) {
      await moveTaskToDate(taskId, null) // Remove date entirely
    }
  }

  return (
    // 3. Pass the id prop here
    <DndContext id={id} sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  )
}