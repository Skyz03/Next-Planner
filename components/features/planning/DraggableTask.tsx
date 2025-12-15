
'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

export default function DraggableTask({ task, children }: { task: any, children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { taskId: task.id } // We only need the ID to identify it
  })

  const style = transform ? {
    transform: CSS.Translate.toString(transform),
    zIndex: 999,
    opacity: 0.9,
    cursor: 'grabbing',
    scale: '1.05'
  } : undefined

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      suppressHydrationWarning={true}
      className={`touch-none cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-2xl rotate-2 opacity-50' : ''}`}
    >
      {children}
    </div>
  )
}