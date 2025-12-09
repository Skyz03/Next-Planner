import { getReviewData } from '@/utils/analytics'
import { saveReflection } from '@/app/actions'
import Link from 'next/link'

export default async function ReflectionPage() {
  const { history, topFocus, totalDone } = await getReviewData()

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 flex justify-center font-sans text-slate-800">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- LEFT COLUMN: THE INTELLIGENCE (Read Only) --- */}
        <div className="space-y-6">
          
          {/* 1. The Insight Card */}
          <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
            <h1 className="text-2xl font-bold mb-1">Weekly Digest</h1>
            <p className="text-indigo-200 text-sm mb-6">Your data tells a story.</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold">{totalDone}</div>
                <div className="text-xs uppercase tracking-wider opacity-70">Tasks Crushed</div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-lg font-bold truncate leading-tight">{topFocus}</div>
                <div className="text-xs uppercase tracking-wider opacity-70">Main Focus</div>
              </div>
            </div>

            {/* AI-Style Insight Text */}
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="italic opacity-90 text-sm">
                "You directed most of your energy toward <span className="font-bold">{topFocus}</span> this week. 
                {totalDone < 5 ? " It looks like a lighter week than usual." : " You kept a high velocity."} 
                Keep it up!"
              </p>
            </div>
          </div>

          {/* 2. The History Timeline (Scrollable) */}
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 h-[500px] flex flex-col">
            <h2 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
              <span>📜</span> Accomplishment Log
            </h2>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {history.length === 0 && (
                <p className="text-slate-400 text-sm text-center mt-10">No completed tasks yet.</p>
              )}
              
              {history.map((task: any) => (
                <div key={task.id} className="flex gap-3 text-sm border-b border-slate-50 pb-3 last:border-0">
                  <div className="mt-1 min-w-[4px] h-4 bg-green-400 rounded-full"></div>
                  <div>
                    <p className="text-slate-700 font-medium line-through decoration-slate-300">{task.title}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-slate-400">{new Date(task.created_at).toLocaleDateString('en-US', { weekday: 'short' })}</span>
                      {task.goals && (
                        <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 uppercase font-bold tracking-wide">
                          {task.goals.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: THE REFLECTION (Actionable) --- */}
        <div className="flex flex-col h-full">
           <div className="bg-white rounded-3xl p-8 shadow-xl border border-white/50 sticky top-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-800">Journal</h2>
                <p className="text-slate-400 text-sm">Review the data on the left, then write.</p>
              </div>

              <form action={saveReflection} className="space-y-6">
                <input type="hidden" name="completed_count" value={totalDone} />
                <input type="hidden" name="week_start" value={new Date().toISOString()} />

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    Looking at your log, what stands out?
                  </label>
                  <textarea 
                    name="win" 
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-700 focus:ring-2 ring-indigo-200 outline-none h-32 resize-none"
                    placeholder="I noticed I accomplished a lot of..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                    What got in the way?
                  </label>
                  <textarea 
                    name="challenge" 
                    className="w-full bg-slate-50 border-none rounded-xl p-4 text-slate-700 focus:ring-2 ring-indigo-200 outline-none h-24 resize-none"
                    placeholder="I didn't get to my Health goals because..."
                  />
                </div>

                <div className="pt-4 flex items-center justify-between">
                   <Link href="/" className="text-slate-400 hover:text-slate-600 text-sm font-medium">Cancel</Link>
                   <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform">
                     Save Review
                   </button>
                </div>
              </form>
           </div>
        </div>

      </div>
    </div>
  )
}