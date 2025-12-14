'use server'

import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateWeeklyInsight(reportData: any) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

        const prompt = `
      Act as an elite productivity coach for a high-performance architect.
      Analyze this weekly report data:
      
      - Productivity Score: ${reportData.score}/100
      - Tasks Completed: ${reportData.completed}/${reportData.total}
      - Biggest Win: "${reportData.biggestWin?.title || 'None'}"
      - Goal Breakdown: ${JSON.stringify(reportData.goalBreakdown)}
      - Daily Velocity (Tasks per day): ${JSON.stringify(reportData.activityByDay)}

      Provide a concise, 3-part strategic review in raw HTML format (no markdown code blocks, just tags like <p>, <strong>, <ul>, <li>):
      
      1. <strong>The Pattern:</strong> One sentence observing a trend (e.g., "You started strong but faded on Friday").
      2. <strong>The Gap:</strong> Identify one goal that was neglected.
      3. <strong>The Protocol:</strong> Give 2 specific, actionable bullet points for next week.

      Keep the tone professional, encouraging, but direct. Max 150 words.
    `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Clean up potential markdown wrapper if Gemini adds it
        return text.replace(/```html/g, '').replace(/```/g, '')

    } catch (error) {
        console.error("AI Error", error)
        return "<p>AI systems are currently recalibrating. Please review your data manually.</p>"
    }
}