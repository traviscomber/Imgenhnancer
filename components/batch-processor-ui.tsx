"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Upload, X, Play, Download, Check, AlertCircle, Loader2, Package, ImageIcon } from "lucide-react"
import { BatchProcessor, type BatchItem, type BatchProgress, downloadBatchAsZip } from "@/utils/batch-processor"

interface BatchProcessorUIProps {
  settings: any
  onComplete?: (results: BatchItem[]) => void
}

export function BatchProcessorUI({ settings, onComplete }: BatchProcessorUIProps) {
  const [files, setFiles] = useState<File[]>([])
  const [items, setItems] = useState<BatchItem[]>([])
  const [progress, setProgress] = useState<BatchProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    processing: 0,
    percentage: 0,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [processor, setProcessor] = useState<BatchProcessor | null>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || [])
    setFiles((prev) => [...prev, ...selectedFiles])
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const startProcessing = async () => {
    if (files.length === 0) return

    setIsProcessing(true)

    const batchProcessor = new BatchProcessor(files, {
      settings,
      maxConcurrent: 3,
      onProgress: (prog) => {
        setProgress(prog)
      },
      onItemComplete: (item) => {
        setItems((prev) => {
          const updated = [...prev]
          const index = updated.findIndex((i) => i.id === item.id)
          if (index >= 0) {
            updated[index] = item
          } else {
            updated.push(item)
          }
          return updated
        })
      },
      onComplete: (results) => {
        console.log("✅ Batch processing complete!", results)
        setIsProcessing(false)
        onComplete?.(results)
      },
    })

    setProcessor(batchProcessor)
    setItems(batchProcessor.getResults())

    try {
      await batchProcessor.start()
    } catch (error) {
      console.error("Batch processing error:", error)
      setIsProcessing(false)
    }
  }

  const downloadAll = async () => {
    const completedItems = items.filter((i) => i.status === "completed")
    if (completedItems.length === 0) return

    try {
      await downloadBatchAsZip(completedItems)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const getStatusIcon = (status: BatchItem["status"]) => {
    switch (status) {
      case "completed":
        return <Check className="w-4 h-4 text-green-500" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      case "processing":
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      default:
        return <ImageIcon className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: BatchItem["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "failed":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "processing":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Package className="w-5 h-5" />
            Batch Processing
          </CardTitle>
          <CardDescription>Upload multiple images and process them all at once</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div
            className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-amber-500 transition-colors cursor-pointer"
            onClick={() => document.getElementById("batch-upload")?.click()}
          >
            <input
              id="batch-upload"
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-300 mb-2">
              {files.length === 0 ? "Click or drag to upload multiple images" : `${files.length} images selected`}
            </p>
            <p className="text-sm text-gray-500">Supports JPG, PNG, WebP (max 10MB each)</p>
          </div>

          {/* File List */}
          {files.length > 0 && !isProcessing && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Selected Files:</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFiles([])}
                  className="text-red-400 hover:text-red-300"
                >
                  Clear All
                </Button>
              </div>
              <ScrollArea className="h-40 w-full rounded-md border border-gray-700 p-2">
                <div className="space-y-2">
                  {files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-800 p-2 rounded">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <ImageIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-white truncate">{file.name}</span>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeFile(index)} className="flex-shrink-0">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Start Button */}
          <Button
            onClick={startProcessing}
            disabled={files.length === 0 || isProcessing}
            className="w-full bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-semibold py-6"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing {progress.percentage}%
              </>
            ) : (
              <>
                <Play className="w-5 h-5 mr-2" />
                Start Batch Processing ({files.length} images)
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress Section */}
      {isProcessing || items.length > 0 ? (
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Processing Progress</CardTitle>
            <CardDescription>
              {progress.completed} of {progress.total} completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Overall Progress</span>
                <span className="text-white font-mono">{progress.percentage}%</span>
              </div>
              <Progress value={progress.percentage} className="h-2" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gray-800 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">{progress.total}</p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-400">{progress.completed}</p>
                <p className="text-xs text-green-400">Completed</p>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-400">{progress.processing}</p>
                <p className="text-xs text-blue-400">Processing</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-400">{progress.failed}</p>
                <p className="text-xs text-red-400">Failed</p>
              </div>
            </div>

            {/* Item List */}
            <ScrollArea className="h-96 w-full rounded-md border border-gray-700 p-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className={`p-4 rounded-lg border ${getStatusColor(item.status)}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getStatusIcon(item.status)}
                        <span className="text-sm font-medium truncate">{item.file.name}</span>
                      </div>
                      <Badge variant="outline" className="flex-shrink-0">
                        {item.status}
                      </Badge>
                    </div>

                    {item.status === "processing" && <Progress value={item.progress} className="h-1 mb-2" />}

                    {item.status === "completed" && item.result && (
                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <img
                          src={item.result.original || "/placeholder.svg"}
                          alt="Original"
                          className="w-full h-24 object-cover rounded"
                        />
                        <img
                          src={item.result.enhanced || "/placeholder.svg"}
                          alt="Enhanced"
                          className="w-full h-24 object-cover rounded"
                        />
                      </div>
                    )}

                    {item.status === "failed" && item.error && (
                      <p className="text-xs text-red-400 mt-2">{item.error}</p>
                    )}

                    {item.endTime && item.startTime && (
                      <p className="text-xs text-gray-500 mt-2">
                        Completed in {((item.endTime - item.startTime) / 1000).toFixed(1)}s
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Download All Button */}
            {progress.completed > 0 && (
              <Button onClick={downloadAll} className="w-full bg-amber-500 hover:bg-amber-600 text-white">
                <Download className="w-4 h-4 mr-2" />
                Download All Enhanced Images ({progress.completed} images)
              </Button>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
