import { createClient } from '@/utils/supabase/server'
import { addTask, addGoal, toggleTask } from './actions'
import { signout } from '@/app/auth/actions'
import Link from 'next/link'

async function getData() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { tasks: [], goals: [] }
  }

  const [tasksResponse, goalsResponse] = await Promise.all([
    supabase.from('tasks').select('*, goals(title)').eq('user_id', user.id).order('created_at', { ascending: false }),
    supabase.from('goals').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
  ])
  return { tasks: tasksResponse.data || [], goals: goalsResponse.data || [] }
}

export default async function Dashboard() {
  const { tasks, goals } = await getData()
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })

  return (
    <div className="flex h-screen p-4 gap-6 font-sans text-slate-800 overflow-hidden">

      {/* --- GLASS SIDEBAR (Navigation & Goals) --- */}
      <aside className="w-80 flex flex-col bg-white/70 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-6 transition-all">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mindful<span className="text-indigo-600">Plan</span>.</h1>
          <p className="text-slate-500 text-sm mt-1">Focus on what matters.</p>
        </div>

        {/* Goals Section */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Visions</h3>
          </div>

          {/* Add Goal Input */}
          <form action={addGoal} className="relative group">
            <input
              name="title"
              placeholder="+ New Goal"
              className="w-full bg-white/50 border border-transparent focus:border-indigo-300 focus:bg-white rounded-xl py-3 px-4 text-sm outline-none transition-all placeholder:text-slate-400 shadow-sm"
            />
          </form>

          {/* Goal Cards */}
          <div className="space-y-3">
            {goals.map(goal => (
              <div key={goal.id} className="group p-4 bg-white/40 hover:bg-white/80 border border-white/50 hover:border-indigo-200 rounded-2xl transition-all cursor-pointer shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">{goal.title}</span>
                  <span className="w-2 h-2 rounded-full bg-indigo-400 group-hover:bg-indigo-600 transition-colors"></span>
                </div>
                <div className="w-full bg-gray-200/50 rounded-full h-1 mt-3 overflow-hidden">
                  <div className="bg-indigo-500 h-1 rounded-full w-[40%]"></div> {/* Mock progress */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="mt-auto pt-6 border-t border-slate-200/50 space-y-3">
          <Link href="/reflection" className="flex items-center justify-center gap-2 w-full py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 hover:shadow-lg transition-all text-sm font-medium">
            <span>✨ Weekly Reflection</span>
          </Link>
          <form action={signout}>
            <button className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-xl hover:shadow-lg transition-all text-sm font-medium border border-red-200">
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* --- MAIN CONTENT (Tasks) --- */}
      <main className="flex-1 flex flex-col h-full bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/40 relative overflow-hidden">

        {/* Header */}
        <header className="p-8 pb-4 flex justify-between items-end bg-gradient-to-b from-white/50 to-transparent">
          <div>
            <h2 className="text-4xl font-extrabold text-slate-800 tracking-tight">Good Day.</h2>
            <p className="text-slate-500 mt-2 font-medium">{today}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-indigo-600">{tasks.filter(t => !t.is_completed).length}</div>
            <div className="text-xs font-bold text-slate-400 uppercase">Pending</div>
          </div>
        </header>

        {/* Task Input Area */}
        <div className="px-8 py-4">
          <form action={addTask} className="relative flex items-center bg-white rounded-2xl shadow-lg border border-slate-100 p-2 focus-within:ring-2 ring-indigo-100 transition-all">
            <div className="pl-4 pr-3 text-slate-400">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </div>
            <input
              name="title"
              type="text"
              placeholder="What's your main focus?"
              className="flex-1 bg-transparent text-lg outline-none placeholder:text-slate-300 text-slate-700 py-2"
              autoComplete="off"
            />

            {/* Minimalist Dropdown */}
            <select name="goal_id" className="mr-2 text-xs bg-slate-50 border-none rounded-lg py-2 px-3 text-slate-500 font-medium outline-none cursor-pointer hover:bg-slate-100">
              <option value="none">General Task</option>
              {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
            </select>

            <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 py-2.5 font-medium transition-all shadow-md hover:shadow-indigo-200">
              Add
            </button>
          </form>
        </div>

        {/* Scrollable Task List */}
        <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-3">
          {tasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
              <p className="text-lg">No tasks yet. Enjoy the silence.</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="group relative flex items-center gap-4 p-5 bg-white/40 hover:bg-white rounded-2xl border border-white/60 hover:border-indigo-100 shadow-sm hover:shadow-md transition-all duration-300">

                {/* Custom Checkbox */}
                <form action={toggleTask.bind(null, task.id, task.is_completed)}>
                  <button className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${task.is_completed ? 'bg-indigo-500 border-indigo-500 rotate-0' : 'border-slate-300 hover:border-indigo-400 rotate-0'}`}>
                    <svg className={`w-3.5 h-3.5 text-white transform transition-transform ${task.is_completed ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  </button>
                </form>

                <div className="flex-1">
                  <p className={`text-lg font-medium transition-all duration-300 ${task.is_completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {task.title}
                  </p>
                </div>

                {/* Badge */}
                {task.goals && (
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-bold uppercase tracking-wider rounded-full border border-indigo-100">
                    {task.goals.title}
                  </span>
                )}

                {/* Hover Glow Effect */}
                <div className="absolute inset-0 rounded-2xl bg-indigo-500/5 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity"></div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}