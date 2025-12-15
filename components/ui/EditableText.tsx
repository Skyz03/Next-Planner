'use client'

import { useState, useRef, useEffect } from 'react'
import { updateTask } from '@/actions/task' // Adjust path if needed
import { updateGoal } from '@/actions/goal'

interface EditableTextProps {
  id: string
  initialText: string
  type: 'task' | 'goal'
  className?: string
}

export default function EditableText({ id, initialText, type, className = '' }: EditableTextProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [text, setText] = useState(initialText)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditing])

  async function handleSave() {
    setIsEditing(false)
    if (text === initialText) return // Don't save if no change

    const formData = new FormData()
    formData.append(type === 'task' ? 'taskId' : 'goalId', id)
    formData.append('title', text)

    // Call the appropriate server action
    if (type === 'task') {
      await updateTask(formData)
    } else {
      await updateGoal(formData)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setText(initialText) // Revert
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`w-full min-w-[100px] border-b border-indigo-500 bg-transparent text-slate-800 outline-none dark:text-slate-100 ${className}`}
      />
    )
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`-ml-1 cursor-pointer rounded border border-transparent px-1 transition-colors hover:border-slate-200 hover:bg-slate-100 dark:hover:border-slate-700 dark:hover:bg-slate-800 ${className}`}
      title="Click to edit"
    >
      {text}
    </span>
  )
}
