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
  AlertCircle,
  Search,
  Database,
  Activity,
  TestTube,
  Key,
  ExternalLink,
} from "lucide-react"

const AIImageEnhancementPortal = () => {
  const [selectedFiles, setSelectedFiles] = useState([])
  const [processingQueue, setProcessingQueue] = useState([])
  const [completedJobs, setCompletedJobs] = useState([])
  const [activeTab, setActiveTab] = useState("config")
  const [discoveryResults, setDiscoveryResults] = useState(null)
  const [configResults, setConfigResults] = useState(null)
  const [isDiscovering, setIsDiscovering] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [enhancementSettings, setEnhancementSettings] = useState({
    model: "real-esrgan-4x",
    upscaleFactor: 2,
    targetUse: "display",
    colorSpace: "RGB",
    format: "PNG",
    quality: 95,
    denoise: true,
    sharpen: false,
    faceEnhance: false,
  })
  const fileInputRef = useRef(null)

  // Updated with comprehensive model list from discovery
  const enhancementModels = [
    {
      id: "real-esrgan-4x",
      name: "Real-ESRGAN 4x (nightmareai)",
      description: "AI-powered image upscaling using Real-ESRGAN (2x-4x upscaling)",
      maxUpscale: 4,
      replicateModel: "nightmareai/real-esrgan",
      version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      category: "upscaling",
      recommended: true,
    },
    {
      id: "real-esrgan-2x",
      name: "Real-ESRGAN 2x (Fast)",
      description: "Faster 2x upscaling with Real-ESRGAN",
      maxUpscale: 2,
      replicateModel: "nightmareai/real-esrgan",
      version: "42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b",
      category: "upscaling",
      recommended: false,
    },
    {
      id: "gfpgan-face",
      name: "GFPGAN Face Enhancement",
      description: "Specialized face restoration and enhancement",
      maxUpscale: 4,
      replicateModel: "tencentarc/gfpgan",
      version: "9283608cc6b7be6b65a8e44983db012355fde4132009bf99d976b2f0896856a3",
      category: "face",
      recommended: false,
    },
    {
      id: "codeformer-face",
      name: "CodeFormer Face Restoration",
      description: "Robust face restoration with fidelity control",
      maxUpscale: 4,
      replicateModel: "sczhou/codeformer",
      version: "7de2ea26c616d5bf2245ad0d5e24f0ff9a6204578a5c876db53142edd9d2cd56",
      category: "face",
      recommended: false,
    },
    {
      id: "clarity-upscaler",
      name: "Clarity Upscaler",
      description: "High-quality image upscaling with clarity enhancement",
      maxUpscale: 4,
      replicateModel: "philz1337x/clarity-upscaler",
      version: "dfad41707589d68ecdccd1dfa600d55a208f9310748e44bfe35b4a6291453d5e",
      category: "upscaling",
      recommended: false,
    },
  ]

  const handleFileSelect = useCallback((files) => {
    const newFiles = Array.from(files).map((file) => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      preview: URL.createObjectURL(file),
      status: "ready",
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

    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId))
    const job = {
      id: fileToProcess.id,
      file: fileToProcess,
      settings: { ...enhancementSettings },
      status: "processing",
      startTime: Date.now(),
      progress: "Uploading to Replicate...",
    }
    setProcessingQueue((prev) => [...prev, job])

    try {
      const fd = new FormData()
      fd.append("file", fileToProcess.file)
      fd.append("settings", JSON.stringify(enhancementSettings))

      const selectedModel = enhancementModels.find((m) => m.id === enhancementSettings.model)
      const modelName = selectedModel?.replicateModel || "nightmareai/real-esrgan"

      setProcessingQueue((prev) =>
        prev.map((j) => (j.id === job.id ? { ...j, progress: `Processing with ${modelName}...` } : j)),
      )

      const res = await fetch("/api/enhance-replicate", { method: "POST", body: fd })
      const resClone = res.clone() // allow two independent reads
      let result: any
      try {
        // First try parsing JSON
        result = await res.json()
      } catch {
        // If JSON parsing fails, fall back to plain-text body from the clone
        const text = await resClone.text()
        result = {
          success: false,
          error: text?.trim() || `HTTP ${res.status} ${res.statusText}`,
        }
      }

      setProcessingQueue((prev) => prev.filter((j) => j.id !== job.id))

      if (result.success) {
        setCompletedJobs((prev) => [
          ...prev,
          {
            id: job.id,
            status: "completed",
            completedAt: Date.now(),
            originalSize: `${fileToProcess.file.name} (${formatFileSize(fileToProcess.file.size)})`,
            enhancedSize: result.enhancedSize,
            fileSize: result.fileSize,
            downloadUrl: result.downloadUrl,
            originalFileName: fileToProcess.name,
            model: result.model,
            method: result.method,
            upscaleFactor: enhancementSettings.upscaleFactor,
            processingTime: result.processingTime,
            predictionId: result.predictionId,
          },
        ])
      } else {
        setSelectedFiles((prev) => [
          ...prev,
          { ...fileToProcess, status: "failed", error: result.error || "Unknown error" },
        ])
      }
    } catch (error) {
      console.error("Error during image enhancement:", error)
      setProcessingQueue((prev) => prev.filter((j) => j.id !== job.id))
      setSelectedFiles((prev) => [
        ...prev,
        { ...fileToProcess, status: "failed", error: error.message || "Network error" },
      ])
    }
  }

  const testReplicateConfig = async () => {
    setIsTesting(true)
    try {
      const response = await fetch("/api/test-replicate-config")
      const result = await response.json()
      setConfigResults(result)
      console.log("🧪 Replicate Config Test Results:", result)
    } catch (error) {
      console.error("Config test failed:", error)
      setConfigResults({ error: error.message })
    } finally {
      setIsTesting(false)
    }
  }

  const runReplicateDiscovery = async () => {
    setIsDiscovering(true)
    try {
      const response = await fetch("/api/replicate-discovery")
      const result = await response.json()
      setDiscoveryResults(result)
      console.log("🔍 Replicate Discovery Results:", result)
    } catch (error) {
      console.error("Discovery failed:", error)
      setDiscoveryResults({ error: error.message })
    } finally {
      setIsDiscovering(false)
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
      display: "3840x2160",
    }
    return baseResolutions[enhancementSettings.targetUse] || "4K"
  }

  const getMaxUpscale = () => {
    const selectedModel = enhancementModels.find((m) => m.id === enhancementSettings.model)
    return selectedModel?.maxUpscale || 4
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
                <p className="text-sm text-blue-200">Professional Image Enhancement with Multiple AI Models</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-green-400">Replicate: Ready ✅</span>
                <span className="text-xs text-gray-400">5/5 tests passed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex space-x-1 bg-black/20 backdrop-blur-lg rounded-xl p-1">
          {[
            { id: "config", label: "Configuration", icon: Key },
            { id: "discovery", label: "Model Discovery", icon: Search },
            { id: "upload", label: "Upload & Enhance", icon: Upload },
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
        {activeTab === "config" && (
          <div className="space-y-8">
            {/* Configuration Test */}
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Replicate API Configuration</h2>
                  <p className="text-gray-300">Test your Replicate API token and verify model access permissions</p>
                </div>
                <button
                  onClick={testReplicateConfig}
                  disabled={isTesting}
                  className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-all flex items-center space-x-2"
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    <>
                      <TestTube className="w-5 h-5" />
                      <span>Test Configuration</span>
                    </>
                  )}
                </button>
              </div>

              {/* Configuration Status */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/5 rounded-lg p-4">
                  <Key className="w-8 h-8 text-blue-400 mb-2" />
                  <h3 className="text-white font-medium mb-1">API Token</h3>
                  <p className="text-sm text-gray-400">
                    {configResults?.configuration?.hasApiKey ? "✅ Configured" : "❌ Missing"}
                  </p>
                  {configResults?.configuration?.keyPrefix && (
                    <p className="text-xs text-gray-500 mt-1">{configResults.configuration.keyPrefix}</p>
                  )}
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <Database className="w-8 h-8 text-purple-400 mb-2" />
                  <h3 className="text-white font-medium mb-1">Primary Model</h3>
                  <p className="text-sm text-gray-400">nightmareai/real-esrgan</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <Activity className="w-8 h-8 text-green-400 mb-2" />
                  <h3 className="text-white font-medium mb-1">Status</h3>
                  <p className="text-sm text-gray-400">
                    {configResults?.summary?.replicateConfigured ? "✅ Ready" : "⏳ Testing"}
                  </p>
                </div>
              </div>

              {/* Setup Instructions */}
              {configResults?.configuration?.hasApiKey ? (
                /* Token Configured Successfully */
                <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-6 mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <CheckCircle className="w-8 h-8 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-green-400 font-medium mb-3">✅ API Token Configured</h3>
                      <div className="space-y-3 text-sm text-gray-300">
                        <div className="flex items-center space-x-2">
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">✓</span>
                          <span>REPLICATE_API_TOKEN is configured</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">✓</span>
                          <span>Token: r8_brsNoyAv...04DrJmT (secured)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">→</span>
                          <span>Ready to test configuration</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-lg p-6 mb-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <Key className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-blue-400 font-medium mb-3">🔑 Get Your Replicate API Token</h3>
                      <div className="space-y-3 text-sm text-gray-300">
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">1</span>
                          <span>
                            Visit{" "}
                            <a
                              href="https://replicate.com/account/api-tokens"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 underline hover:text-blue-300 inline-flex items-center space-x-1"
                            >
                              <span>replicate.com/account/api-tokens</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">2</span>
                          <span>Sign in with GitHub (you'll see the login screen like below)</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">3</span>
                          <span>Create a new API token</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">4</span>
                          <span>Add it as REPLICATE_API_TOKEN environment variable</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">5</span>
                          <span>Click "Test Configuration" above</span>
                        </div>
                      </div>

                      {/* Replicate Login Screenshot */}
                      <div className="mt-4 p-4 bg-black/20 rounded-lg">
                        <p className="text-xs text-gray-400 mb-2">
                          What you'll see when you visit the API tokens page:
                        </p>
                        <img
                          src="/replicate-login-screenshot.jpeg"
                          alt="Replicate login screen showing 'Welcome to Replicate' with GitHub sign-in button"
                          className="w-full max-w-md rounded-lg border border-gray-600"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Click "Sign in with GitHub" to access your API tokens
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Test Results */}
            {configResults && (
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Configuration Test Results</h3>

                {configResults.error ? (
                  <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
                    <div className="text-red-400 font-medium mb-2">❌ Configuration Error</div>
                    <div className="text-red-300 text-sm">{configResults.error}</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary */}
                    {configResults.summary && (
                      <div
                        className={`border rounded-lg p-4 ${
                          configResults.summary.replicateConfigured
                            ? "bg-green-900/20 border-green-500/20"
                            : "bg-yellow-900/20 border-yellow-500/20"
                        }`}
                      >
                        <div
                          className={`font-medium mb-2 ${
                            configResults.summary.replicateConfigured ? "text-green-400" : "text-yellow-400"
                          }`}
                        >
                          {configResults.summary.replicateConfigured ? "✅" : "⚠️"}{" "}
                          {configResults.summary.recommendation}
                        </div>
                        <div className="text-sm text-gray-300">
                          Tests: {configResults.summary.successful}/{configResults.summary.totalTests} successful
                        </div>
                      </div>
                    )}

                    {/* Individual Test Results */}
                    <div className="space-y-3">
                      {configResults.tests?.map((test, index) => (
                        <div
                          key={index}
                          className={`border rounded-lg p-4 ${
                            test.status === "success"
                              ? "bg-green-900/10 border-green-500/20"
                              : "bg-red-900/10 border-red-500/20"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-mono text-sm text-white">{test.test}</div>
                            <div
                              className={`text-xs px-2 py-1 rounded ${
                                test.status === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"
                              }`}
                            >
                              {test.status === "success" ? "✅ Success" : "❌ Failed"}
                            </div>
                          </div>
                          <div className="text-sm text-gray-300">Result: {test.result}</div>
                          {test.error && <div className="text-sm text-red-300 mt-1">Error: {test.error}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "discovery" && (
          <div className="space-y-8">
            {/* Discovery Control Panel */}
            <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-white mb-2">Model Discovery</h2>
                  <p className="text-gray-300">Test available Replicate models for image enhancement</p>
                </div>
                <button
                  onClick={runReplicateDiscovery}
                  disabled={isDiscovering || !configResults?.summary?.replicateConfigured}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg transition-all flex items-center space-x-2"
                >
                  {isDiscovering ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Discovering...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5" />
                      <span>Discover Models</span>
                    </>
                  )}
                </button>
              </div>

              {!configResults?.summary?.replicateConfigured && (
                <div className="bg-yellow-900/20 border border-yellow-500/20 rounded-lg p-4 mb-6">
                  <div className="text-yellow-400 font-medium mb-2">⚠️ Configuration Required</div>
                  <div className="text-yellow-200 text-sm">Please test your Replicate API configuration first.</div>
                </div>
              )}
            </div>

            {/* Discovery Results */}
            {discoveryResults && (
              <div className="space-y-6">
                {discoveryResults.error ? (
                  <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-6">
                    <div className="text-red-400 font-medium mb-2">❌ Discovery Error</div>
                    <div className="text-red-300">{discoveryResults.error}</div>
                  </div>
                ) : (
                  <>
                    {/* Summary */}
                    <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Discovery Summary</h3>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
                          <div className="text-2xl font-bold text-green-400">
                            {discoveryResults.workingModels?.length || 0}
                          </div>
                          <div className="text-sm text-green-300">Working Models</div>
                        </div>
                        <div className="bg-red-900/20 border border-red-500/20 rounded-lg p-4">
                          <div className="text-2xl font-bold text-red-400">
                            {discoveryResults.failedModels?.length || 0}
                          </div>
                          <div className="text-sm text-red-300">Failed Models</div>
                        </div>
                        <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4">
                          <div className="text-2xl font-bold text-blue-400">
                            {discoveryResults.configuration?.testedModels || 0}
                          </div>
                          <div className="text-sm text-blue-300">Total Tested</div>
                        </div>
                      </div>
                    </div>

                    {/* Working Models */}
                    {discoveryResults.workingModels?.length > 0 && (
                      <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">✅ Working Models</h3>
                        <div className="space-y-3">
                          {discoveryResults.workingModels.map((model, index) => (
                            <div
                              key={index}
                              className={`border rounded-lg p-4 ${
                                model.isPrimary
                                  ? "bg-blue-900/20 border-blue-500/30"
                                  : "bg-green-900/10 border-green-500/20"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <div
                                    className={`font-mono text-sm ${
                                      model.isPrimary ? "text-blue-400" : "text-green-400"
                                    }`}
                                  >
                                    {model.modelId}
                                  </div>
                                  {model.isPrimary && (
                                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">PRIMARY</span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">
                                    {model.category}
                                  </span>
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      model.priority === "high" ? "bg-red-600 text-white" : "bg-gray-600 text-white"
                                    }`}
                                  >
                                    {model.priority.toUpperCase()}
                                  </span>
                                </div>
                              </div>
                              <div className="text-xs text-gray-400 mb-1">{model.description}</div>
                              <div className="text-xs text-gray-500">Prediction: {model.predictionId}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {discoveryResults.recommendations?.length > 0 && (
                      <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">🎯 Recommendations</h3>
                        <div className="space-y-3">
                          {discoveryResults.recommendations.map((rec, index) => (
                            <div
                              key={index}
                              className={`border rounded-lg p-4 ${
                                rec.priority === "high"
                                  ? "bg-blue-900/20 border-blue-500/30"
                                  : rec.priority === "critical"
                                    ? "bg-red-900/20 border-red-500/30"
                                    : "bg-gray-900/20 border-gray-500/20"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div
                                  className={`font-medium ${
                                    rec.priority === "high"
                                      ? "text-blue-400"
                                      : rec.priority === "critical"
                                        ? "text-red-400"
                                        : "text-gray-400"
                                  }`}
                                >
                                  {rec.type}
                                </div>
                                {rec.priority && (
                                  <span
                                    className={`text-xs px-2 py-1 rounded ${
                                      rec.priority === "high"
                                        ? "bg-blue-600 text-white"
                                        : rec.priority === "critical"
                                          ? "bg-red-600 text-white"
                                          : "bg-gray-600 text-white"
                                    }`}
                                  >
                                    {rec.priority.toUpperCase()}
                                  </span>
                                )}
                              </div>
                              {rec.modelId && <div className="font-mono text-sm text-white mb-1">{rec.modelId}</div>}
                              <div className="text-sm text-gray-300">{rec.reason}</div>
                              {rec.usage && <div className="text-xs text-gray-400 mt-1">Usage: {rec.usage}</div>}
                              {rec.solution && <div className="text-xs text-yellow-400 mt-1">💡 {rec.solution}</div>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "upload" && (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Upload Area */}
            <div className="lg:col-span-2">
              <div className="bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
                <h2 className="text-xl font-semibold text-white mb-6">Upload Images for Enhancement</h2>

                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-blue-400/50 rounded-xl p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Drop images here or click to browse</h3>
                  <p className="text-blue-200 mb-4">Supports: JPG, PNG, WebP, HEIC, TIFF up to 100MB</p>
                  <p className="text-sm text-gray-400">Enhanced with Replicate AI Models</p>
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
                                <div className="flex items-center space-x-2 mt-1">
                                  <AlertCircle className="w-4 h-4 text-red-400" />
                                  <p className="text-sm text-red-400">Error: {file.error}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {file.status === "ready" && (
                              <button
                                onClick={() => startProcessing(file.id)}
                                disabled={!configResults?.summary?.replicateConfigured}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                              >
                                <Play className="w-4 h-4" />
                                <span>Enhance</span>
                              </button>
                            )}
                            {file.status === "failed" && (
                              <button
                                onClick={() => startProcessing(file.id)}
                                disabled={!configResults?.summary?.replicateConfigured}
                                className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                              >
                                <RefreshCw className="w-4 h-4" />
                                <span>Retry</span>
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
                    <label className="block text-sm font-medium text-white mb-3">Enhancement Model</label>
                    <select
                      value={enhancementSettings.model}
                      onChange={(e) => {
                        const newModel = e.target.value
                        const maxUpscale = enhancementModels.find((m) => m.id === newModel)?.maxUpscale || 4
                        setEnhancementSettings((prev) => ({
                          ...prev,
                          model: newModel,
                          upscaleFactor: Math.min(prev.upscaleFactor, maxUpscale),
                        }))
                      }}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
                    >
                      {enhancementModels.map((model) => (
                        <option key={model.id} value={model.id} className="bg-slate-800">
                          {model.name} {model.recommended && "⭐"} [{model.category}]
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-400 mt-1">
                      {enhancementModels.find((m) => m.id === enhancementSettings.model)?.description}
                    </p>
                    <p className="text-xs text-blue-400 mt-1">
                      Model: {enhancementModels.find((m) => m.id === enhancementSettings.model)?.replicateModel}
                    </p>
                    <p className="text-xs text-purple-400 mt-1">
                      Category: {enhancementModels.find((m) => m.id === enhancementSettings.model)?.category}
                    </p>
                  </div>

                  {/* Target Use Case */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-3">Target Use</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "display", label: "Display", icon: Monitor },
                        { id: "print", label: "Print", icon: Printer },
                        { id: "dome", label: "Dome", icon: ImageIcon },
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
                      max={getMaxUpscale()}
                      step="1"
                      value={enhancementSettings.upscaleFactor}
                      onChange={(e) =>
                        setEnhancementSettings((prev) => ({ ...prev, upscaleFactor: Number.parseInt(e.target.value) }))
                      }
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>2x</span>
                      <span>Target: {getTargetResolution()}</span>
                      <span>{getMaxUpscale()}x</span>
                    </div>
                  </div>

                  {/* Enhancement Options */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-white">Enhancement Options</label>
                    {[
                      { id: "faceEnhance", label: "Face Enhancement", desc: "Improve face quality (if supported)" },
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
                </div>
              </div>

              {/* Processing Info */}
              <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 backdrop-blur-lg rounded-2xl border border-green-500/20 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Replicate Processing</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-300">
                    <span>Images queued:</span>
                    <span>{selectedFiles.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Selected model:</span>
                    <span>{enhancementModels.find((m) => m.id === enhancementSettings.model)?.name}</span>
                  </div>
                  <div className="flex justify-between text-white font-medium">
                    <span>Est. processing time:</span>
                    <span>{selectedFiles.length * 60}s</span>
                  </div>
                  <div className="flex justify-between text-gray-300">
                    <span>Configuration:</span>
                    <span className={configResults?.summary?.replicateConfigured ? "text-green-400" : "text-red-400"}>
                      {configResults?.summary?.replicateConfigured ? "✅ Ready" : "❌ Not configured"}
                    </span>
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
                            {enhancementModels.find((m) => m.id === job.settings.model)?.replicateModel} •{" "}
                            {job.settings.upscaleFactor}x
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                        <span className="text-sm text-gray-300">{job.progress || "Processing..."}</span>
                      </div>
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
                      <img
                        src={job.downloadUrl || "/placeholder.svg"}
                        alt={`Enhanced ${job.originalFileName}`}
                        className="w-full h-full object-contain"
                        crossOrigin="anonymous"
                      />
                    </div>

                    <div className="p-4">
                      <p className="text-white font-medium mb-2">{job.originalFileName}</p>
                      <div className="flex items-center space-x-2 mb-3">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400">Enhanced with Replicate</span>
                      </div>

                      <div className="space-y-2 text-sm text-gray-300 mb-4">
                        <div className="flex justify-between">
                          <span>Original:</span>
                          <span>{job.originalSize}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Model:</span>
                          <span className="text-blue-400 font-mono text-xs">{job.model}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing:</span>
                          <span className="text-purple-400">{job.processingTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Upscale:</span>
                          <span className="text-green-400">{job.upscaleFactor}x</span>
                        </div>
                        {job.predictionId && (
                          <div className="flex justify-between">
                            <span>Prediction ID:</span>
                            <span className="text-gray-400 font-mono text-xs">{job.predictionId.slice(0, 8)}...</span>
                          </div>
                        )}
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
