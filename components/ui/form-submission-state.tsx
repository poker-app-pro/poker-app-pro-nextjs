"use client"

import type React from "react"

import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

export type FormSubmissionState = "idle" | "submitting" | "success" | "error"

interface FormSubmissionStateProps {
  state: FormSubmissionState
  title: string
  icon?: React.ReactNode
  successTitle?: string
  successMessage?: string
  errorMessage?: string
  redirectMessage?: string
}

export function FormSubmissionState({
  state,
  title,
  icon,
  successTitle = "Saved Successfully!",
  successMessage = "Your data has been saved.",
  errorMessage,
  redirectMessage = "Redirecting...",
}: FormSubmissionStateProps) {
  if (state === "idle") {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 mx-4">
        {state === "submitting" && (
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
            <h2 className="text-xl font-medium mb-2">Saving {title}...</h2>
            <p className="text-muted-foreground">Please wait while we process your data.</p>
          </div>
        )}

        {state === "success" && (
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-green-50 mx-auto mb-4 flex items-center justify-center">
              {icon || <CheckCircle className="h-8 w-8 text-green-600" />}
            </div>
            <h2 className="text-xl font-medium mb-2">{successTitle}</h2>
            <p className="text-muted-foreground mb-6">{successMessage}</p>
            <p className="text-sm text-muted-foreground">{redirectMessage}</p>
          </div>
        )}

        {state === "error" && (
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-red-50 mx-auto mb-4 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-xl font-medium mb-2">Error</h2>
            <p className="text-red-600">{errorMessage || "An error occurred. Please try again."}</p>
          </div>
        )}
      </div>
    </div>
  )
}
