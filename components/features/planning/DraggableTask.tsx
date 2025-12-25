'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

export default function DraggableTask({
  task,
  children,
  className, // 🆕 Accept className
  style: propStyle,

}: {
  task: any
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { taskId: task.id }, // We only need the ID to identify it
  })

  const style = {
    ...propStyle,
    transform: CSS.Translate.toString(transform),
    zIndex: 999,
    opacity: 0.9,
    cursor: 'grabbing',
    scale: '1.05',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      suppressHydrationWarning={true}
      className={`${className || ''} cursor-grab touch-none active:cursor-grabbing ${isDragging ? 'shadow-2xl scale-105' : ''}`}
    >
      {children}
    </div>
  )
}