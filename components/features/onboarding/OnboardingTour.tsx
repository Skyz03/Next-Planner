'use client'

import { useEffect } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { completeOnboarding } from '@/actions/user'
import { useRouter } from 'next/navigation'

export default function OnboardingTour({ hasSeenTour }: { hasSeenTour: boolean }) {
    const router = useRouter()

    useEffect(() => {
        if (hasSeenTour) return

        const driverObj = driver({
            showProgress: true,
            animate: true,
            allowClose: false, // Force them to finish or explicitly skip
            popoverClass: 'driver-popover-theme',
            steps: [
                // STEP 1: WELCOME
                {
                    element: '#tour-welcome', // Attach this ID to your DashboardShell or Main Wrapper
                    popover: {
                        title: 'Welcome to the Studio',
                        description: 'This is your operating system for high-performance work. Let\'s configure your environment.',
                        side: "bottom",
                        align: 'center'
                    }
                },
                // STEP 2: AUTO-SWITCH TO PLAN MODE
                {
                    element: '#view-toggle-plan',
                    popover: {
                        title: 'The Strategy Phase',
                        description: 'First, we switch to **Plan Mode**. This opens your sidebar and gives you a bird\'s eye view of the week.',
                        side: "bottom",
                        align: 'center'
                    },
                    onHighlightStarted: () => {
                        // 🤖 AUTO-PILOT: Click the plan button
                        const btn = document.getElementById('view-toggle-plan')
                        if (btn) btn.click()
                    },
                },
                // STEP 3: EXPLAIN GOALS (Now visible because sidebar is open)
                {
                    element: '#tour-goals',
                    popover: {
                        title: '1. Define Rituals',
                        description: 'Your strategic goals live here. Drag them onto the board to create actionable tasks.',
                        side: "right",
                        align: 'start'
                    }
                },
                // STEP 4: EXPLAIN INBOX
                {
                    element: '#tour-inbox',
                    popover: {
                        title: '2. The Inbox',
                        description: 'Capture loose thoughts here (Cmd+K) so they don\'t clutter your mind.',
                        side: "right",
                        align: 'start'
                    }
                },
                // STEP 5: REFLECTION
                {
                    element: '#tour-reflection',
                    popover: {
                        title: '4. Close the Loop',
                        description: 'At the end of the week, generate your AI Report Card here to improve your systems.',
                        side: "bottom",
                        align: 'end'
                    }
                },
                // STEP 6: AUTO-SWITCH BACK TO FOCUS
                {
                    element: '#view-toggle-focus',
                    popover: {
                        title: 'The Execution Phase',
                        description: 'Once planned, we switch to **Focus Mode**. This hides the noise so you can execute.',
                        side: "bottom",
                        align: 'center'
                    },
                    onHighlightStarted: () => {
                        // 🤖 AUTO-PILOT: Click the focus button
                        const btn = document.getElementById('view-toggle-focus')
                        if (btn) btn.click()
                    },
                },
                // STEP 7: EXPLAIN TIMER
                {
                    element: '#tour-focus', // Ensure this ID is on the TimeGrid container
                    popover: {
                        title: '3. Deep Work',
                        description: 'This is your daily view. Tasks appear here only when scheduled. Click "Start" to track your flow state.',
                        side: "left",
                        align: 'start'
                    }
                },

            ],
            onDestroyStarted: () => {
                // Mark as complete in DB when tour finishes
                completeOnboarding()
                driverObj.destroy()
            },
        })

        // Start tour after a brief mount delay
        const timer = setTimeout(() => {
            driverObj.drive()
        }, 1500)

        return () => clearTimeout(timer)
    }, [hasSeenTour])

    return null
}