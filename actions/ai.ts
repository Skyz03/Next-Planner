'use server'

import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateWeeklyInsight(reportData: any) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" })

    const prompt = `
      Act as an elite "Chief of Staff" for a high-performance Architect. 
      Analyze this weekly productivity data:
      
      - **Score:** ${reportData.score}/100
      - **Focus Hours:** ${reportData.focusHours}h (Deep Work)
      - **Peak Energy Time:** ${reportData.peakTime} (When they complete the most tasks)
      - **Planning Accuracy:** ${reportData.planningAccuracy} (Ratio of Actual vs Planned time)
      - **Biggest Win:** "${reportData.biggestWin?.title || 'None'}"
      - **Goal Distribution:** ${JSON.stringify(reportData.goalBreakdown.map((g: any) => ({ name: g.name, percent: Math.round(g.completed / g.total * 100) })))}
      
      Generate a strategic review in strict **JSON format** with exactly these 3 fields:
      
      1. "executive_summary": A 2-sentence high-level summary of the week's performance. Use a professional, encouraging but direct tone.
      2. "psych_analysis": Analyze their behavior. Specifically mention their Peak Energy Time and Planning Accuracy. (e.g., "You are a Morning Lark but consistently underestimate task complexity.")
      3. "tactical_protocol": An array of 3 specific, short actionable bullet points for next week based on the data.

      Example JSON structure:
      {
        "executive_summary": "Strong momentum in the first half...",
        "psych_analysis": "Your data suggests...",
        "tactical_protocol": ["Schedule coding blocks before 11am", "Add 15m buffer to meetings", "Delegate low-priority admin"]
      }
      
      Return ONLY raw JSON. No markdown formatting.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Clean potential markdown
    const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim()

    return JSON.parse(cleanedText)

  } catch (error) {
    console.error("AI Error", error)
    return null
  }
}