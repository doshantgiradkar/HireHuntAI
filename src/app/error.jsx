"use client"

import { useEffect } from "react"
import { toast } from "sonner"

export default function ErrorBoundary({ error, reset }) {
  useEffect(() => {
    // Log the error to console in development
    console.error("Error:", error)
    
    // Show error toast
    toast.error("Something went wrong", {
      description: error?.message || "An unexpected error occurred. Please try again.",
      duration: 5000,
      action: {
        label: "Retry",
        onClick: reset,
      },
    })
  }, [error, reset])

  return null // Let the page continue rendering with fallback UI
}
