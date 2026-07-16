/**
 * Error handling utilities for clar1ty enhancement workflow
 */

export type ErrorType =
  | "insufficient_credits"
  | "file_too_large"
  | "invalid_file_type"
  | "upload_failed"
  | "processing_failed"
  | "download_expired"
  | "network_error"
  | "unknown_error"

export interface EnhancementError {
  type: ErrorType
  message: string
  action?: string
  actionLabel?: string
}

export const ERROR_MESSAGES: Record<ErrorType, EnhancementError> = {
  insufficient_credits: {
    type: "insufficient_credits",
    message: "You don't have enough credits for this enhancement mode.",
    action: "upgrade",
    actionLabel: "Buy more credits",
  },
  file_too_large: {
    type: "file_too_large",
    message: "File size exceeds your plan limit.",
    action: "upgrade",
    actionLabel: "Upgrade plan",
  },
  invalid_file_type: {
    type: "invalid_file_type",
    message: "File type not supported. Use JPG, PNG, WEBP, or TIFF.",
    action: null,
    actionLabel: null,
  },
  upload_failed: {
    type: "upload_failed",
    message: "Upload failed. Please check your connection and try again.",
    action: "retry",
    actionLabel: "Retry upload",
  },
  processing_failed: {
    type: "processing_failed",
    message: "Enhancement failed. Please try again or contact support.",
    action: "support",
    actionLabel: "Contact support",
  },
  download_expired: {
    type: "download_expired",
    message: "Download link expired. Enhanced images are only available for 24-48 hours.",
    action: "reprocess",
    actionLabel: "Process again",
  },
  network_error: {
    type: "network_error",
    message: "Network error. Please check your connection.",
    action: "retry",
    actionLabel: "Retry",
  },
  unknown_error: {
    type: "unknown_error",
    message: "Something went wrong. Please try again or contact support.",
    action: "support",
    actionLabel: "Contact support",
  },
}

export function getFileError(file: File, maxSizeMB: number): ErrorType | null {
  const validTypes = ["image/jpeg", "image/png", "image/webp", "image/tiff"]

  if (!validTypes.includes(file.type)) {
    return "invalid_file_type"
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return "file_too_large"
  }

  return null
}

export function getCreditError(
  availableCredits: number,
  requiredCredits: number
): ErrorType | null {
  if (availableCredits < requiredCredits) {
    return "insufficient_credits"
  }

  return null
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return (bytes / Math.pow(k, i)).toFixed(2) + " " + sizes[i]
}
