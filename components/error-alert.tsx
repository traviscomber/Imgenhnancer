import { AlertCircle, X } from "lucide-react"
import type { EnhancementError } from "@/lib/error-handling"

interface ErrorAlertProps {
  error: EnhancementError | null
  onDismiss: () => void
  onAction?: () => void
}

export function ErrorAlert({ error, onDismiss, onAction }: ErrorAlertProps) {
  if (!error) return null

  return (
    <div className="rounded-xl border border-red-900/50 bg-red-900/20 p-4">
      <div className="flex items-start gap-4">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-300">{error.message}</p>
          {error.actionLabel && (
            <button
              onClick={onAction}
              className="mt-3 text-sm font-semibold text-red-400 hover:text-red-300 transition"
            >
              {error.actionLabel}
            </button>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="text-red-500 hover:text-red-400 transition flex-shrink-0"
          aria-label="Dismiss error"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
