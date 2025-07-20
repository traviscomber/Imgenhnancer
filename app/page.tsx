"use client"

import { useState, useRef, useCallback } from "react"
import {
  Upload,
  ImageIcon,
  Settings,
  Download,
  Zap,
  Monitor,
  Printer,
  Loader2,
  CheckCircle,
  Play,
  X,
  RefreshCw,
} from "lucide-react"
import { enhanceImageAction } from "@/app/actions" // Import the new Server Action

const AIImageEnhancementPortal = () => {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [processingQueue, setProcessingQueue] = useState([])
  const [completedJobs, setCompletedJobs] = useState([])
  const [activeTab, setActiveTab] = useState("upload")
  const [enhancementSettings, setEnhancementSettings] = useState({
    model: "real-esrgan-4x",
    upscaleFactor: 4,
    targetUse: "dome",
    colorSpace: "RGB",
    format: "PNG",
    quality: 95,
    denoise: true,
    sharpen: false,
    faceEnhance: false,
  })
  const fileInputRef = useRef(null)

  const enhancementModels = [
    {
      id: "real-esrgan-4x",
      name: "Real-ESRGAN 4x",
      description: "Best for photos and realistic images",
      maxUpscale: 4,
    },
    {
      id: "real-esrgan-anime",
      name: "Real-ESRGAN Anime",
      description: "Optimized for anime and illustrations",
      maxUpscale: 4,
    },
    { id: "esrgan-general", name: "ESRGAN General", description: "Versatile model for mixed content", maxUpscale: 8 },
    { id: "waifu2x", name: "Waifu2x", description: "Specialized for artwork and drawings", maxUpscale: 2 },
    { id: "supir-v0q", name: "SUPIR v0Q", description: "Latest diffusion-based upscaler", maxUpscale: 8 },
    {
      id: "openmodeldb-custom",
      name: "OpenModelDB Custom",
      description: "Community models for specific use cases",
      maxUpscale: 16,
    },
  ]

  const handleFileSelect = useCallback((files) => {
    const newFiles = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file),
      status: "ready", // 'ready', 'failed'
      error: null,
    }))
    setSelectedFiles((prev) => [...prev, ...newFiles])
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
  }, [])

  const startProcessing = async (fileId) => {
    const fileToProcess = selectedFiles.find((f) => f.id === fileId)
    if (!fileToProcess) return

    // Remove from selectedFiles and add to processingQueue
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId))

    const job = {
      id: fileToProcess.id, // Use original file ID for job tracking
      file: fileToProcess,
      settings: { ...enhancementSettings },
      status: "processing",
      startTime: Date.now(),
    }
    setProcessingQueue((prev) => [...prev, job])

    try {
      const result = await enhanceImageAction(fileToProcess.file, enhancementSettings)

      setProcessingQueue((prev) => prev.filter((j) => j.id !== job.id)) // Remove from processing

      if (result.success) {
        setCompletedJobs((prev) => [
          ...prev,
          {
            id: job.id,
            status: "completed",
            completedAt: Date.now(),
            originalSize: `${fileToProcess.file.name} (${formatFileSize(fileToProcess.file.size)})`,
            enhancedSize: result.enhancedSize || "N/A", // From API or placeholder
            fileSize: result.fileSize || "N/A", // From API or placeholder
            downloadUrl: result.downloadUrl,
            originalFileName: fileToProcess.name,
          },
        ])
      } else {
        // If processing fails, move it back to selectedFiles with a 'failed' status
        setSelectedFiles((prev) => [
          ...prev,
          { ...fileToProcess, status: "failed", error: result.error || "Unknown error" },
        ])
      }
    } catch (error: any) {
      console.error("Error during image enhancement:", error)
      setProcessingQueue((prev) => prev.filter((j) => j.id !== job.id)) // Remove from processing
      setSelectedFiles((prev) => [
        ...prev,
        { ...fileToProcess, status: "failed", error: error.message || "Network error" },
      ])
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getTargetResolution = () => {
    const baseResolutions = {
      dome: "8192x8192",
      print: "16384x12288",
      display: "7680x4320",
    }
    return baseResolutions[enhancementSettings.targetUse] || "4K+"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">AI Enhancement Portal</h1>
                <p className="text-sm text-blue-200">
                  Professional Image Upscaling for Dome Projections & Large Format Printing
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-green-400">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>API Status: Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex space-x-1 bg-black/20 backdrop-blur-lg rounded-xl p-1">
          {[
            { id: "upload", label: "Upload & Configure", icon: Upload },
            { id: "processing", label: "Processing Queue", icon: Settings },
            { id: "results", label: "Enhanced Images", icon: Download },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                activeTab === tab.id ? "bg-blue-600 text-white" : "text-blue-200 hover:text-white hover:bg-white/10"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {activeTab === "upload" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
                <h2 className="text-xl font-semibold text-white mb-6">Upload Images</h2>

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-blue-400/50 rounded-xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Drop images here or click to browse</h3>
                  <p className="text-blue-200 mb-4">Supports: JPG, PNG, WebP, HEIC, TIFF up to 100MB</p>
                  <p className="text-sm text-gray-400">Perfect for dome projections and large format printing</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                {/* File List */}
                {selectedFiles.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-medium text-white mb-4">Selected Files ({selectedFiles.length})</h3>
                    <div className="space-y-3">
                      {selectedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                          <div className="flex items-center space-x-4">
                            <img
                              src={file.preview || "/placeholder.svg"}
                              alt=""
                              className="w-12 h-12 object-cover rounded-lg"
                            />
                            <div>
                              <p className="text-white font-medium">{file.name}</p>
                              <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                              {file.status === "failed" && (
                                <p className="text-sm text-red-400 mt-1">Error: {file.error}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {file.status === "ready" && (
                              <button
                                onClick={() => startProcessing(file.id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            {file.status === "failed" && (
                              <button
                                onClick={() => startProcessing(file.id)} // Retry button
                                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedFiles((prev) => prev.filter((f) => f.id !== file.id))}
                              className="text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Settings Panel */}
            <div className="space-y-6">
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-6">Enhancement Settings</h3>

                <div className="space-y-6">
                  {/* AI Model Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">AI Model</label>
                    <select
                      value={enhancementSettings.model}
                      onChange={(e) => setEnhancementSettings((prev) => ({ ...prev, model: e.target.value }))}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    >
                      {enhancementModels.map((model) => (
                        <option key={model.id} value={model.id} className="bg-slate-800">
                          {model.name}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      {enhancementModels.find((m) => m.id === enhancementSettings.model)?.description}
                    </p>
                  </div>
                  {/* Target Use Case */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Target Use</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "dome", label: "Dome", icon: Monitor },
                        { id: "print", label: "Print", icon: Printer },
                        { id: "display", label: "Display", icon: ImageIcon },
                      ].map((use) => (
                        <button
                          key={use.id}
                          onClick={() => setEnhancementSettings((prev) => ({ ...prev, targetUse: use.id }))}
                          className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                            enhancementSettings.targetUse === use.id
                              ? "bg-blue-600 text-white"
                              : "bg-white/5 text-gray-300 hover:bg-white/10"
                          }`}
                        >
                          <use.icon className="w-5 h-5 mb-1" />
                          <span className="text-xs">{use.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Upscale Factor */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">
                      Upscale Factor: {enhancementSettings.upscaleFactor}x
                    </label>
                    <input
                      type="range"
                      min="2"
                      max="16"
                      step="2"
                      value={enhancementSettings.upscaleFactor}
                      onChange={(e) =>
                        setEnhancementSettings((prev) => ({ ...prev, upscaleFactor: Number.parseInt(e.target.value) }))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>2x</span>
                      <span>Target: {getTargetResolution()}</span>
                      <span>16x</span>
                    </div>
                  </div>
                  {/* Enhancement Options */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white">Enhancement Options</label>
                    {[
                      { id: "denoise", label: "Noise Reduction", desc: "Remove image noise and artifacts" },
                      { id: "sharpen", label: "Sharpen Details", desc: "Enhance edge definition" },
                      { id: "faceEnhance", label: "Face Enhancement", desc: "Specialized face restoration" },
                    ].map((option) => (
                      <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={enhancementSettings[option.id]}
                          onChange={(e) =>
                            setEnhancementSettings((prev) => ({ ...prev, [option.id]: e.target.checked }))
                          }
                          className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded"
                        />
                        <div>
                          <p className="text-sm text-white">{option.label}</p>
                          <p className="text-xs text-gray-400">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {/* Output Format */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Output Format</label>
                    <div className="grid grid-cols-2 gap-2">
                      {["PNG", "TIFF"].map((format) => (
                        <button
                          key={format}
                          onClick={() => setEnhancementSettings((prev) => ({ ...prev, format }))}
                          className={`p-2 rounded-lg text-sm transition-all ${
                            enhancementSettings.format === format
                              ? "bg-blue-600 text-white"
                              : "bg-white/5 text-gray-300 hover:bg-white/10"
                          }`}
                        >
                          {format}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Cost Estimation */}
              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl border border-green-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Cost Estimation</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Images queued:</span>
                    <span>{selectedFiles.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Est. processing time:</span>
                    <span>{selectedFiles.length * 30}s</span>
                  </div>
                  <div className="flex justify-between text-white font-medium">
                    <span>Est. cost:</span>
                    <span>${(selectedFiles.length * 0.021).toFixed(3)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "processing" && (
          <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Processing Queue</h2>

            {processingQueue.length === 0 ? (
              <div className="text-center py-12">
                <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No images currently processing</p>
                <p className="text-sm text-gray-500 mt-2">Start processing from the Upload tab</p>
              </div>
            ) : (
              <div className="space-y-4">
                {processingQueue.map((job) => (
                  <div key={job.id} className="bg-white/5 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <img
                          src={job.file.preview || "/placeholder.svg"}
                          alt=""
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                        <div>
                          <p className="text-white font-medium">{job.file.name}</p>
                          <p className="text-sm text-gray-400">
                            {job.settings.model} • {job.settings.upscaleFactor}x
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                        <span className="text-sm text-gray-300">Processing...</span>
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>Processing with {job.settings.model}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === "results" && (
          <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Enhanced Images</h2>

            {completedJobs.length === 0 ? (
              <div className="text-center py-12">
                <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No enhanced images yet</p>
                <p className="text-sm text-gray-500 mt-2">Completed enhancements will appear here</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedJobs.map((job) => (
                  <div key={job.id} className="bg-white/5 rounded-lg overflow-hidden">
                    <div className="aspect-video bg-gradient-to-br from-blue-900/20 to-purple-900/20 flex items-center justify-center">
                      {/* Display the enhanced image preview if available, otherwise a placeholder */}
                      <img
                        src={job.downloadUrl || "/placeholder.svg"}
                        alt={`Enhanced ${job.originalFileName}`}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="p-4">
                      <p className="text-white font-medium mb-2">{job.originalFileName}</p>
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">Enhancement Complete</span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-300 mb-4">
                        <div className="flex justify-between">
                          <span>Original:</span>
                          <span>{job.originalSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Enhanced:</span>
                          <span className="text-green-400">{job.enhancedSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>File size:</span>
                          <span>{job.fileSize}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => window.open(job.downloadUrl, "_blank")}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Enhanced</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AIImageEnhancementPortal
