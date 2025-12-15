'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function ErrorMessage({ error }: { error?: string }) {
  const [showError, setShowError] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (error && error.trim()) {
      setShowError(true)
      // Clear error from URL after showing it
      const timer = setTimeout(() => {
        router.replace('/login')
      }, 5000) // Clear after 5 seconds

      return () => clearTimeout(timer)
    }
  }, [error, router])

  if (!showError || !error?.trim()) {
    return null
  }

  return (
    <div className="relative rounded-lg border border-red-500/50 bg-red-500/20 p-3 text-center text-sm text-red-200">
      <button
        onClick={() => {
          setShowError(false)
          router.replace('/login')
        }}
        className="absolute top-2 right-2 text-red-300 hover:text-red-100"
        aria-label="Dismiss error"
      >
        ×
      </button>
      {error}
    </div>
  )
}
