'use client'

import { useDroppable } from '@dnd-kit/core'

export default function DroppableDay({ dateStr, children, className = "" }: { dateStr: string | null, children: React.ReactNode, className?: string }) {
  // Pass dateStr as null to create a "Backlog" drop zone
  const { isOver, setNodeRef } = useDroppable({
    id: `date-${dateStr || 'backlog'}`, 
    data: { date: dateStr }
  })

  return (
    <div 
      ref={setNodeRef} 
      className={`${className} transition-colors duration-300 ${
        isOver ? 'bg-orange-100 dark:bg-orange-900/30 ring-2 ring-orange-400 dark:ring-orange-500' : ''
      }`}
    >
      {children}
    </div>
  )
}