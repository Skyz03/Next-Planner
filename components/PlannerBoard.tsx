'use client'

import { DndContext, DragEndEvent, DragOverlay, useSensors, useSensor, PointerSensor } from '@dnd-kit/core'
import { moveTaskToDate } from '@/app/actions'
import { useTransition, useState } from 'react'

export default function PlannerBoard({ children }: { children: React.ReactNode }) {
  const [isPending, startTransition] = useTransition()
  
  // Sensors ensure we can click buttons inside draggable items without dragging
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Drag only starts after moving 8px (prevents accidental clicks)
      },
    })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    
    if (!over) return

    const taskId = active.data.current?.taskId
    const dateStr = over.data.current?.date // This will be '2023-10-27' or null

    if (taskId) {
        // We use Optimistic UI via Next.js Server Actions automatically 
        // by wrapping this in startTransition if we had local state, 
        // but here we just fire-and-forget for the server update.
        await moveTaskToDate(taskId, dateStr)
    }
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
      {/* Optional: Add <DragOverlay> here if you want a fancy preview while dragging */}
    </DndContext>
  )
}