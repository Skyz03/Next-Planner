'use client'

import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { createPortal } from 'react-dom'

export default function MobileSidebar({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen(!isOpen)

  return (
    <>
      {/* TRIGGER BUTTON (Visible only on Mobile) */}
      <button 
        onClick={toggle}
        className="md:hidden p-2 -ml-2 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* BACKDROP & PANEL */}
      {isOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={toggle}
          />
          
          {/* Sidebar Drawer */}
          <div className="absolute top-0 bottom-0 left-0 w-[85%] max-w-sm bg-[#F5F5F4] dark:bg-[#18181b] shadow-2xl animate-in slide-in-from-left duration-300 flex flex-col">
            {/* Close Button Header */}
            <div className="flex justify-end p-4 border-b border-stone-200 dark:border-stone-800">
               <button onClick={toggle} className="p-2 text-stone-400 hover:text-stone-600">
                  <X className="w-6 h-6" />
               </button>
            </div>
            
            {/* Content passed from parent (The original sidebar) */}
            <div className="flex-1 overflow-hidden relative">
               {children}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}