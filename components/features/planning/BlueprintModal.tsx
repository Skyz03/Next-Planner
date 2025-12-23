'use client'

import { useState } from 'react'
import { Copy, Plus, Trash2, X, Calendar, Clock, LayoutTemplate, Repeat } from 'lucide-react'
import { addBlueprintItem, deleteBlueprintItem, applyBlueprintToWeek } from '@/actions/blueprint'
import { useFormStatus } from 'react-dom'

export default function BlueprintModal({ items, currentDateStr }: { items: any[], currentDateStr: string }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors"
      >
        <LayoutTemplate className="w-3.5 h-3.5" />
        Blueprint
      </button>
    )
  }

  // Grouping Logic for Display
  const getDayLabel = (val: number | null) => {
    if (val === null) return 'Inbox / Floating'
    if (val === 7) return 'Every Single Day'
    if (val === 8) return 'Weekdays (Mon-Fri)'
    if (val === 9) return 'Weekends (Sat-Sun)'
    return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][val]
  }

  // Custom sort order for the display list
  // 7,8,9 first (recurring), then Mon-Sun (1-6, 0), then Inbox (null)
  const displayOrder = [7, 8, 9, 1, 2, 3, 4, 5, 6, 0, null]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl bg-[#FAFAF9] dark:bg-[#1C1917] rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-8 border-b border-stone-200 dark:border-stone-800 flex justify-between items-start bg-white dark:bg-[#262626]">
          <div className="space-y-1">
            <h2 className="text-3xl font-serif font-bold text-stone-900 dark:text-white flex items-center gap-3">
               <LayoutTemplate className="w-8 h-8 text-orange-500" />
               The Weekly Blueprint
            </h2>
            <p className="text-base text-stone-500 dark:text-stone-400">
               Design your "Default Week." Smart templates that skip duplicates automatically.
            </p>
          </div>
          <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-400 hover:text-stone-600 transition-colors">
             <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
           
           {/* LEFT COLUMN: Editor */}
           <div className="p-8 md:w-[350px] flex-shrink-0 bg-stone-50 dark:bg-[#202022] border-r border-stone-200 dark:border-stone-800 overflow-y-auto">
              <div className="mb-6">
                 <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-1">New Template</h3>
                 <p className="text-xs text-stone-500">Add a recurring ritual.</p>
              </div>

              <form action={addBlueprintItem} className="space-y-5">
                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-600 dark:text-stone-300">Task Title</label>
                    <input name="title" placeholder="e.g. Morning Cardio" required className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-all shadow-sm" />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center gap-2">
                       <Repeat className="w-3 h-3" /> Frequency
                    </label>
                    <div className="relative">
                       <select name="day_of_week" className="w-full appearance-none bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-all shadow-sm">
                          {/* 🆕 NEW OPTIONS */}
                          <optgroup label="Recurring">
                             <option value="8">Weekdays (Mon-Fri)</option>
                             <option value="7">Everyday (Mon-Sun)</option>
                             <option value="9">Weekend (Sat-Sun)</option>
                          </optgroup>
                          <optgroup label="Specific Day">
                             <option value="1">Monday</option>
                             <option value="2">Tuesday</option>
                             <option value="3">Wednesday</option>
                             <option value="4">Thursday</option>
                             <option value="5">Friday</option>
                             <option value="6">Saturday</option>
                             <option value="0">Sunday</option>
                          </optgroup>
                          <optgroup label="Unscheduled">
                             <option value="">Inbox / Floating</option>
                          </optgroup>
                       </select>
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 1L5 5L9 1"/></svg>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-600 dark:text-stone-300 flex items-center gap-2">
                       <Clock className="w-3 h-3" /> Duration (Minutes)
                    </label>
                    <input type="number" name="duration" placeholder="60" defaultValue={60} className="w-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-500 transition-all shadow-sm" />
                 </div>

                 <div className="pt-4">
                    <SubmitButton />
                 </div>
              </form>
           </div>

           {/* RIGHT COLUMN: Visual Blueprint */}
           <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[#FAFAF9] dark:bg-[#1C1917]">
              {items.length === 0 ? (
                 <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <LayoutTemplate className="w-16 h-16 mb-4 text-stone-300" />
                    <p className="text-lg font-serif font-bold text-stone-400">Your blueprint is empty.</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {displayOrder.map(dayCode => {
                       // Filter items that match this day code
                       // Note: Ensure your DB returns numbers, not strings for day_of_week
                       const dayItems = items.filter(i => i.day_of_week === dayCode)
                       if (dayItems.length === 0) return null
                       
                       const isRecurrent = [7, 8, 9].includes(dayCode as number)
                       
                       return (
                          <div key={String(dayCode)} className="break-inside-avoid">
                             <div className="flex items-center gap-3 mb-3 pb-2 border-b border-stone-200 dark:border-stone-800">
                                <span className={`text-xs font-bold uppercase tracking-widest ${isRecurrent ? 'text-purple-600 dark:text-purple-400' : 'text-orange-600 dark:text-orange-500'}`}>
                                   {getDayLabel(dayCode as number)}
                                </span>
                             </div>
                             
                             <div className="space-y-2">
                                {dayItems.map(item => (
                                   <div key={item.id} className="group relative flex items-center justify-between bg-white dark:bg-[#262626] border border-stone-100 dark:border-stone-800 p-3 rounded-xl hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all duration-200">
                                      <div>
                                         <div className="text-sm font-semibold text-stone-800 dark:text-stone-200">{item.title}</div>
                                         <div className="text-[10px] font-medium text-stone-400 flex items-center gap-1 mt-0.5">
                                            <Clock className="w-3 h-3" /> {item.duration}m
                                         </div>
                                      </div>
                                      <button 
                                         onClick={() => deleteBlueprintItem(item.id)} 
                                         className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                      >
                                         <Trash2 className="w-4 h-4" />
                                      </button>
                                   </div>
                                ))}
                             </div>
                          </div>
                       )
                    })}
                 </div>
              )}
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white dark:bg-[#202022] flex justify-between items-center border-t border-stone-200 dark:border-stone-800">
           <div className="text-xs text-stone-400 font-medium">{items.length} templates defined</div>
           <div className="flex gap-4">
              <button onClick={() => setIsOpen(false)} className="px-6 py-2.5 text-sm font-bold text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors">Cancel</button>
              <form action={async () => {
                 await applyBlueprintToWeek(currentDateStr)
                 setIsOpen(false)
              }}>
                 <button type="submit" className="px-8 py-2.5 bg-stone-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold shadow-lg shadow-stone-900/10 hover:scale-105 hover:shadow-xl transition-all flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Apply to Current Week
                 </button>
              </form>
           </div>
        </div>
      </div>
    </div>
  )
}

function SubmitButton() {
   const { pending } = useFormStatus()
   return (
      <button disabled={pending} type="submit" className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2">
         {pending ? 'Adding...' : <><Plus className="w-4 h-4" /> Add Template</>}
      </button>
   )
}