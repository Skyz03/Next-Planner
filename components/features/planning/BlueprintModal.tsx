'use client'

import { useState } from 'react'
import { Copy, Plus, Trash2, X } from 'lucide-react'
import { addBlueprintItem, deleteBlueprintItem, applyBlueprintToWeek } from '@/actions/blueprint'
import { useFormStatus } from 'react-dom'

export default function BlueprintModal({ 
  items, 
  currentDateStr 
}: { 
  items: any[], 
  currentDateStr: string 
}) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800 rounded-lg transition-colors"
      >
        <Copy className="w-3.5 h-3.5" />
        Blueprint
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-[#FAFAF9] dark:bg-[#1C1917] rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-stone-200 dark:border-stone-800 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 dark:text-white">The Weekly Blueprint</h2>
            <p className="text-sm text-stone-500 mt-1">Design your ideal week. These tasks will be copied when you run the blueprint.</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-stone-400 hover:text-stone-600"><X className="w-5 h-5" /></button>
        </div>

        {/* Content - Two Columns */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
           
           {/* Left: Add New Item */}
           <div className="p-6 md:w-1/3 bg-white dark:bg-[#262626] border-r border-stone-200 dark:border-stone-800">
              <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-4">Add Recurring Item</h3>
              <form action={addBlueprintItem} className="space-y-4">
                 <div>
                    <input name="title" placeholder="Task Name (e.g. Weekly Review)" required className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-sm outline-none focus:border-orange-500" />
                 </div>
                 <div className="flex gap-2">
                    <select name="day_of_week" className="flex-1 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-2 text-xs outline-none focus:border-orange-500">
                       <option value="">(Inbox / Unscheduled)</option>
                       <option value="1">Monday</option>
                       <option value="2">Tuesday</option>
                       <option value="3">Wednesday</option>
                       <option value="4">Thursday</option>
                       <option value="5">Friday</option>
                       <option value="6">Saturday</option>
                       <option value="0">Sunday</option>
                    </select>
                    <input type="number" name="duration" placeholder="60m" className="w-16 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-2 text-xs text-center outline-none focus:border-orange-500" />
                 </div>
                 <SubmitButton />
              </form>
           </div>

           {/* Right: Existing Items List */}
           <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
              <div className="space-y-1">
                 {[1, 2, 3, 4, 5, 6, 0, null].map(day => {
                    const dayItems = items.filter(i => i.day_of_week === day) // basic filter
                    if (dayItems.length === 0) return null
                    
                    const dayLabel = day === null ? 'Inbox / Floating' : 
                                     day === 1 ? 'Monday' : 
                                     day === 2 ? 'Tuesday' : 
                                     day === 3 ? 'Wednesday' : 
                                     day === 4 ? 'Thursday' : 
                                     day === 5 ? 'Friday' : 
                                     day === 6 ? 'Saturday' : 'Sunday'

                    return (
                       <div key={dayLabel} className="mb-4">
                          <h4 className="text-[10px] font-bold uppercase text-orange-500 mb-2">{dayLabel}</h4>
                          <div className="space-y-2">
                             {dayItems.map(item => (
                                <div key={item.id} className="flex items-center justify-between group bg-white dark:bg-[#1C1917] border border-stone-200 dark:border-stone-800 p-2 rounded-lg hover:border-orange-300 transition-colors">
                                   <div className="flex items-center gap-2">
                                      <div className="w-1 h-8 bg-stone-200 dark:bg-stone-700 rounded-full"></div>
                                      <div>
                                         <div className="text-sm font-medium">{item.title}</div>
                                         <div className="text-[10px] text-stone-400">{item.duration}m</div>
                                      </div>
                                   </div>
                                   <button onClick={() => deleteBlueprintItem(item.id)} className="text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                </div>
                             ))}
                          </div>
                       </div>
                    )
                 })}
                 {items.length === 0 && <div className="text-center text-stone-400 text-sm py-10">Blueprint is empty. Add tasks to define your standard week.</div>}
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-100 dark:bg-[#262626] flex justify-end gap-3 border-t border-stone-200 dark:border-stone-800">
           <button onClick={() => setIsOpen(false)} className="px-4 py-2 text-sm font-medium text-stone-500 hover:text-stone-700">Cancel</button>
           <form action={async () => {
              await applyBlueprintToWeek(currentDateStr)
              setIsOpen(false)
           }}>
              <button type="submit" className="px-6 py-2 bg-stone-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                 <Copy className="w-4 h-4" />
                 Apply Blueprint to Current Week
              </button>
           </form>
        </div>
      </div>
    </div>
  )
}

function SubmitButton() {
   const { pending } = useFormStatus()
   return (
      <button disabled={pending} type="submit" className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2">
         {pending ? 'Adding...' : <><Plus className="w-3 h-3" /> Add to Blueprint</>}
      </button>
   )
}