'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function generateWeeklyInsight(reportData: any) {
  try {
    // 1. Use the Flash model (Lowest token cost, fastest response)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    // 2. Pre-calculate summaries to save tokens
    // Instead of sending 30 days of raw JSON, we send 1 sentence.
    const topGoal = reportData.goalBreakdown[0]?.name || 'General Tasks'
    const busyDay =
      reportData.activityByDay.sort((a: any, b: any) => b.total - a.total)[0]?.day || 'Monday'

    // 3. Ultra-Compact Prompt
    const prompt = `
      Role: Elite Productivity Coach.
      User Stats:
      - Score: ${reportData.score}/100
      - Focus: ${reportData.focusHours}h
      - Busiest Day: ${busyDay}
      - Top Goal: ${topGoal}
      - Calibration: ${reportData.planningAccuracy}

      Task: Return valid JSON with 3 keys.
      1. "summary": 1 punchy sentence summarizing performance.
      2. "insight": 1 sentence connecting their Busiest Day to their Planning Accuracy.
      3. "protocol": Array of 2 short, direct commands for next week.
      
      No markdown.
    `

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    // Clean and Parse
    return JSON.parse(
      text
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim(),
    )
  } catch (error) {
    console.error('AI Error', error)
    return null
  }
}
