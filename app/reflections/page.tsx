import { getWeeklyStats } from '@/utils/stats'
import { saveReflection } from '@/app/actions' // Adjust path if needed
import Link from 'next/link'

export default async function ReflectionPage() {
    const { completed, total, startOfWeek } = await getWeeklyStats()
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
            <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">

                {/* Header / Stats Section */}
                <div className="bg-blue-600 p-8 text-white text-center">
                    <h1 className="text-2xl font-bold mb-2">Weekly Review</h1>
                    <p className="opacity-90 mb-6">Let's see how you did this week.</p>

                    <div className="flex justify-center gap-8">
                        <div className="text-center">
                            <div className="text-4xl font-bold">{completed}</div>
                            <div className="text-blue-200 text-sm uppercase tracking-wide">Completed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold">{percentage}%</div>
                            <div className="text-blue-200 text-sm uppercase tracking-wide">Success Rate</div>
                        </div>
                    </div>
                </div>

                {/* The Form */}
                <form action={saveReflection} className="p-8 space-y-6">

                    {/* Hidden fields to pass data to server action */}
                    <input type="hidden" name="completed_count" value={completed} />
                    <input type="hidden" name="week_start" value={startOfWeek.toISOString()} />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            🏆 What was your biggest win?
                        </label>
                        <textarea
                            name="win"
                            className="w-full border-gray-300 bg-gray-50 rounded-lg p-3 focus:ring-2 ring-blue-500 outline-none border"
                            rows={3}
                            placeholder="I finally shipped the MVP..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            🚧 What was the biggest challenge?
                        </label>
                        <textarea
                            name="challenge"
                            className="w-full border-gray-300 bg-gray-50 rounded-lg p-3 focus:ring-2 ring-blue-500 outline-none border"
                            rows={3}
                            placeholder="I got distracted by..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            ⚡ Energy Level (1-10)
                        </label>
                        <div className="flex justify-between px-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                                <label key={num} className="cursor-pointer">
                                    <input type="radio" name="energy" value={num} className="sr-only peer" />
                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm text-gray-500 hover:bg-gray-100 peer-checked:bg-blue-600 peer-checked:text-white transition-all">
                                        {num}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <Link href="/" className="flex-1 py-3 text-center text-gray-600 font-medium hover:bg-gray-50 rounded-lg">
                            Cancel
                        </Link>
                        <button type="submit" className="flex-1 bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition-all">
                            Save Review
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}