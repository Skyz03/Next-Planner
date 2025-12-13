'use client'

import { DndContext, DragEndEvent, useSensors, useSensor, PointerSensor } from '@dnd-kit/core'
import { moveTaskToDate } from '@/app/actions'
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
    })
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const taskId = active.data.current?.taskId
    const dateStr = over.data.current?.date

    if (taskId) {
      await moveTaskToDate(taskId, dateStr)
    }
  }

  return (
    // 3. Pass the id prop here
    <DndContext id={id} sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
    </DndContext>
  )
}