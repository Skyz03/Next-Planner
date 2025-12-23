'use client'

import { useState } from 'react'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'
import DraggableTask from '@/components/features/planning/DraggableTask'
import EditableText from '@/components/ui/EditableText'
import AIGenerateButton from '@/components/features/planning/AIGenerateButton'
import { addTask } from '@/actions/task'
import { deleteGoal } from '@/actions/goal'
import DurationInput from '@/components/ui/DurationInput'

// Assuming deleteGoal is imported from @/actions/goal
import { deleteGoal as deleteGoalAction } from '@/actions/goal'

export default function SidebarGoal({ goal }: { goal: any }) {
  const [isExpanded, setIsExpanded] = useState(false) // Default to closed

  return (
    <div className="group/goal relative pl-2">
      {/* 1. The Connector Line (Visual Hierarchy) */}
      <div className="absolute top-8 bottom-0 left-[19px] w-px bg-stone-200 dark:bg-stone-800"></div>

      {/* 2. GOAL HEADER (Clickable Accordion) */}
      <div className="relative mb-2 flex items-start gap-3">
        {/* Toggle Button / Status Dot */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative z-10 mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg border border-stone-200 bg-white shadow-sm transition-all hover:border-orange-300 hover:shadow-md dark:border-stone-700 dark:bg-stone-900 dark:hover:border-orange-800"
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-stone-500" />
          ) : (
            <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
          )}
        </button>

        {/* Title & Actions */}
        <div className="min-w-0 flex-1 py-1">
          <div className="group/title flex items-center justify-between">
            <h3 className="truncate pr-2 text-sm font-semibold text-stone-800 dark:text-stone-200">
              <EditableText
                id={goal.id}
                initialText={goal.title}
                type="goal"
                className="transition-colors hover:text-orange-600"
              />
            </h3>

            {/* Hover Actions */}
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover/title:opacity-100">
              <AIGenerateButton goalId={goal.id} goalTitle={goal.title} />

              <form action={deleteGoalAction}>
                <input type="hidden" name="goalId" value={goal.id} />
                <button className="rounded p-1 text-stone-300 transition-colors hover:bg-red-50 hover:text-red-400 dark:hover:bg-red-900/20">
                  <Trash2 className="h-3 w-3" />
                </button>
              </form>
            </div>
          </div>

          {/* Summary Text (When Collapsed) */}
          {!isExpanded && (
            <div
              onClick={() => setIsExpanded(true)}
              className="mt-0.5 cursor-pointer truncate text-[10px] text-stone-400 hover:text-stone-500"
            >
              {goal.steps.length} steps inside
            </div>
          )}
        </div>
      </div>

      {/* 3. EXPANDABLE CONTENT (The Steps) */}
      {isExpanded && (
        <div className="animate-in slide-in-from-top-2 fade-in relative space-y-2 pr-1 pb-4 pl-9 duration-200">
          {goal.steps.length === 0 && (
            <div className="flex items-center gap-2 py-2 opacity-50">
              <div className="h-px w-3 bg-stone-300"></div>
              <p className="text-[10px] text-stone-500 italic">No rituals yet.</p>
            </div>
          )}

          {goal.steps.map((task: any) => (
            <DraggableTask key={task.id} task={task}>
              <div className="group flex cursor-grab items-center justify-between rounded-lg border border-stone-100 bg-white px-3 py-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md active:cursor-grabbing dark:border-stone-800 dark:bg-[#222] dark:hover:border-orange-900">
                <div className="min-w-0 flex-1">
                  <EditableText
                    id={task.id}
                    initialText={task.title}
                    type="task"
                    className="block truncate text-xs font-medium text-stone-600 dark:text-stone-300"
                  />
                </div>
                {/* Drag Handle Indicator */}
                <div className="pl-2 text-stone-300 opacity-0 group-hover:opacity-100">⋮⋮</div>
              </div>
            </DraggableTask>
          ))}

          {/* Add Step Form */}
          <form
            action={addTask}
            className="group/add relative mt-2 opacity-60 transition-opacity hover:opacity-100"
          >
            <input type="hidden" name="date_type" value="backlog" />
            <input type="hidden" name="goal_id" value={goal.id} />

            <div className="flex items-center gap-2">
              <div className="flex h-4 w-4 items-center justify-center rounded bg-stone-100 text-stone-400 transition-colors group-hover/add:bg-orange-100 group-hover/add:text-orange-500 dark:bg-stone-800">
                <Plus className="h-3 w-3" />
              </div>
              <input
                name="title"
                placeholder="Add next step..."
                className="w-full border-b border-transparent bg-transparent py-1 text-xs text-stone-600 transition-colors outline-none placeholder:text-stone-300 focus:border-stone-300 dark:text-stone-400 dark:focus:border-stone-600"
              />
              {/* ✅ NEW: Duration Picker */}
              <div className="opacity-0 group-hover/add:opacity-100 focus-within:opacity-100 transition-opacity">
                <DurationInput defaultMinutes={60} />
              </div>

              <select
                name="priority"
                defaultValue="medium"
                className="rounded border border-stone-200 bg-transparent px-1.5 py-0.5 text-[10px] text-stone-500 opacity-0 transition-opacity outline-none group-hover/add:opacity-100 focus:opacity-100 dark:border-stone-700 dark:text-stone-400"
              >
                <option value="low">Low</option>
                <option value="medium">Med</option>
                <option value="high">High</option>
              </select>
              <input type="number" name="duration" defaultValue={60} hidden />
            </div>

            {/* Hidden submit button so Enter reliably submits on all browsers */}
            <button type="submit" className="hidden" />
          </form>
        </div>
      )}
    </div>
  )
}
