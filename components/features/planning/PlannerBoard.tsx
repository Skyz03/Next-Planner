'use client'

import {
  DndContext,
  DragEndEvent,
  useSensors,
  useSensor,
  MouseSensor, // 👈 Import Mouse
  TouchSensor  // 👈 Import Touch
} from '@dnd-kit/core'
import { moveTaskToDate, scheduleTaskTime } from '@/actions/task'
import { useTransition, useId } from 'react'

export default function PlannerBoard({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition()
  const id = useId()

  // ✅ RESPONSIVE SENSORS
  // We separate Mouse and Touch behaviors to prevent blocking scroll on mobile.
  const sensors = useSensors(
    // 1. Mouse: Standard "Click and Drag" behavior
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10, // User must move mouse 10px to start drag (prevents accidental clicks)
      },
    }),
    // 2. Touch: "Long Press" to drag, otherwise scroll
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250, // 👈 Key for mobile: Hold 250ms to pick up task
        tolerance: 5, // Allow slight movement (shaking finger) during the hold
      },
    }),
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const taskId = active.data.current?.taskId
    const overId = String(over.id)

    // 1. Dropped on Time Grid Slot
    if (overId.startsWith('slot-')) {
      const timeStr = over.data.current?.time
      await scheduleTaskTime(taskId, timeStr, 60)
    }

    // 2. Dropped on DOCK (Unschedule time, keep date)
    else if (overId === 'dock') {
      await scheduleTaskTime(taskId, null)
    }

    // 3. Dropped on DATE (DroppableDay)
    else if (over.data.current?.date) {
      const dateStr = over.data.current?.date
      await moveTaskToDate(taskId, dateStr)
    }

    // 4. Dropped on BACKLOG SIDEBAR
    else if (overId.includes('backlog')) {
      await moveTaskToDate(taskId, null)
    }
  }

  return (
    <DndContext
      id={id}
      sensors={sensors}
      onDragEnd={handleDragEnd}
      // Optional: autoScroll helps when dragging to the edge of the mobile screen
      autoScroll={{ layoutShiftCompensation: false }}
    >
      {children}
    </DndContext>
  )
}