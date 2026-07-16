"use client"

import { useState } from "react"
import { Upload, X, Settings, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { PublicPresetKey } from "@/lib/presets"

export interface BatchFile {
  id: string
  file: File
  preview: string
  preset: PublicPresetKey
  mode: "x2" | "x3" | "x4"
  status: "pending" | "processing" | "completed" | "failed"
  progress?: number
}

interface BatchProcessorProps {
  maxFiles: number
  onFilesSelected: (files: BatchFile[]) => void
  onProcessAll: (files: BatchFile[]) => void
  isProcessing: boolean
}

export function BatchProcessor({
  maxFiles,
  onFilesSelected,
  onProcessAll,
  isProcessing,
}: BatchProcessorProps) {
  const [files, setFiles] = useState<BatchFile[]>([])

  const handleFileSelect = (newFiles: FileList | null) => {
    if (!newFiles) return

    const remainingSlots = maxFiles - files.length
    const filesToAdd = Array.from(newFiles).slice(0, remainingSlots)

    const batchFiles: BatchFile[] = filesToAdd.map((file) => ({
      id: Math.random().toString(36),
      file,
      preview: URL.createObjectURL(file),
      preset: "clean_enhance" as PublicPresetKey,
      mode: "x3" as const,
      status: "pending",
    }))

    const updated = [...files, ...batchFiles]
    setFiles(updated)
    onFilesSelected(updated)
  }

  const updateFile = (
    id: string,
    updates: Partial<Omit<BatchFile, "id" | "file" | "preview">>
  ) => {
    const updated = files.map((f) => (f.id === id ? { ...f, ...updates } : f))
    setFiles(updated)
  }

  const removeFile = (id: string) => {
    const updated = files.filter((f) => f.id !== id)
    setFiles(updated)
  }

  const totalCredits = files.reduce((sum, f) => {
    const costs: Record<string, number> = { x2: 6, x3: 8, x4: 10 }
    return sum + (costs[f.mode] || 0)
  }, 0)

  if (files.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] p-12 text-center">
        <Upload className="mx-auto h-8 w-8 text-[#c9953d] mb-4" />
        <p className="text-sm font-semibold text-[#f1e5d3]">Select files for batch processing</p>
        <p className="mt-2 text-xs text-[#8f8678]">Up to {maxFiles} images ({maxFiles * 30}MB max)</p>
        <label className="mt-6 inline-block">
          <span className="rounded-lg bg-[#c9953d] px-6 py-2 text-sm font-semibold text-black hover:bg-[#d7a957] transition cursor-pointer">
            Choose files
          </span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </label>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Files Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => (
          <div key={file.id} className="rounded-2xl border border-white/8 bg-white/[0.03] overflow-hidden">
            {/* Preview */}
            <div className="relative h-32 bg-black/40 flex items-center justify-center overflow-hidden">
              <img
                src={file.preview}
                alt={file.file.name}
                className="h-full w-full object-cover"
              />
              {file.status === "processing" && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <Loader2 className="h-6 w-6 text-[#c9953d] animate-spin" />
                </div>
              )}
              {file.status === "completed" && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-900/40">
                  <Download className="h-6 w-6 text-green-400" />
                </div>
              )}
              <button
                onClick={() => removeFile(file.id)}
                className="absolute top-2 right-2 p-1 rounded-lg bg-red-900/40 hover:bg-red-900/60 transition"
                disabled={isProcessing}
              >
                <X className="h-4 w-4 text-red-400" />
              </button>
            </div>

            {/* Info & Controls */}
            <div className="p-4">
              <p className="text-xs text-[#8f8678] truncate">{file.file.name}</p>

              <div className="mt-3 space-y-2">
                <div>
                  <label className="text-xs uppercase tracking-[0.12em] text-[#c9953d]">Preset</label>
                  <select
                    value={file.preset}
                    onChange={(e) =>
                      updateFile(file.id, { preset: e.target.value as PublicPresetKey })
                    }
                    className="mt-1 w-full rounded-lg border border-white/8 bg-black/40 px-2 py-1 text-xs text-[#f1e5d3] focus:border-[#c9953d] focus:outline-none"
                    disabled={isProcessing || file.status === "processing"}
                  >
                    <option value="clean_enhance">Clean Enhance</option>
                    <option value="old_photo_restore">Old Photo Restore</option>
                    <option value="face_detail">Face Detail</option>
                    <option value="cultural_detail">Cultural Detail</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-[0.12em] text-[#c9953d]">Mode</label>
                  <select
                    value={file.mode}
                    onChange={(e) => updateFile(file.id, { mode: e.target.value as "x2" | "x3" | "x4" })}
                    className="mt-1 w-full rounded-lg border border-white/8 bg-black/40 px-2 py-1 text-xs text-[#f1e5d3] focus:border-[#c9953d] focus:outline-none"
                    disabled={isProcessing || file.status === "processing"}
                  >
                    <option value="x2">x2 (6 cr)</option>
                    <option value="x3">x3 (8 cr)</option>
                    <option value="x4">x4 (10 cr)</option>
                  </select>
                </div>
              </div>

              {file.status === "processing" && file.progress !== undefined && (
                <div className="mt-3">
                  <div className="h-1.5 rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#c9953d] transition-all"
                      style={{ width: `${file.progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#8f8678]">{file.progress}%</p>
                </div>
              )}

              {file.status === "completed" && (
                <p className="mt-3 text-xs text-green-400 font-semibold">Processing complete</p>
              )}
            </div>
          </div>
        ))}

        {/* Add More Button */}
        {files.length < maxFiles && (
          <label className="rounded-2xl border-2 border-dashed border-white/20 bg-white/[0.02] h-48 flex items-center justify-center cursor-pointer hover:border-[#c9953d] transition">
            <div className="text-center">
              <Upload className="mx-auto h-6 w-6 text-[#c9953d] mb-2" />
              <p className="text-xs text-[#8f8678]">Add more files</p>
              <p className="text-xs text-[#6f5d49] mt-1">
                {maxFiles - files.length} slots remaining
              </p>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={isProcessing}
            />
          </label>
        )}
      </div>

      {/* Summary & Actions */}
      <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold text-[#f1e5d3]">
              {files.length} file{files.length !== 1 ? "s" : ""} selected
            </p>
            <p className="mt-1 text-sm text-[#d7a957]">Total credits: {totalCredits}</p>
          </div>
          <Settings className="h-5 w-5 text-[#c9953d]" />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => onProcessAll(files)}
            disabled={isProcessing || files.length === 0}
            className="flex-1 bg-[#c9953d] hover:bg-[#d7a957] text-black font-semibold disabled:opacity-50"
          >
            {isProcessing ? "Processing..." : "Process all"}
          </Button>
          <Button
            onClick={() => setFiles([])}
            disabled={isProcessing}
            variant="outline"
            className="flex-1 border-[#6f5d49] text-[#d4c7b6] hover:bg-[#221913]"
          >
            Clear all
          </Button>
        </div>
      </div>

      {/* File Limit Notice */}
      {files.length === maxFiles && (
        <div className="rounded-lg bg-amber-900/20 border border-amber-900/50 p-3">
          <p className="text-xs text-amber-400">
            You've reached the batch limit of {maxFiles} files. Delete some to add more.
          </p>
        </div>
      )}
    </div>
  )
}
