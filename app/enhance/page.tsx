"use client"

import type React from "react"

import { useState } from "react"
import { Upload, Sparkles, Download, AlertCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { compressImage } from "@/utils/image-processing"

interface EnhancedImage {
  id: string
  original: string
  enhanced: string | null
  status: "pending" | "processing" | "complete" | "error"
  error?: string
  downloadUrl?: string
}

export default function EnhancePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [enhancedImages, setEnhancedImages] = useState<EnhancedImage[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [upscaleFactor, setUpscaleFactor] = useState(2)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setSelectedFiles(files)
  }

  const handleEnhance = async () => {
    if (selectedFiles.length === 0) return

    setIsProcessing(true)

    // Create initial image records
    const newImages: EnhancedImage[] = selectedFiles.map((file, index) => ({
      id: `img-${Date.now()}-${index}`,
      original: URL.createObjectURL(file),
      enhanced: null,
      status: "pending",
    }))

    setEnhancedImages(newImages)

    // Process each image
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const imageId = newImages[i].id

      // Update status to processing
      setEnhancedImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, status: "processing" } : img)))

      try {
        // Compress image before upload
        console.log(`🔄 Compressing image: ${file.name}`)
        const compressedBlob = await compressImage(file, 800) // Max 800KB
        const compressedFile = new File([compressedBlob], file.name, { type: "image/jpeg" })

        console.log(`📤 Uploading ${file.name} (${Math.round(compressedFile.size / 1024)}KB)`)

        const formData = new FormData()
        formData.append("file", compressedFile)
        formData.append(
          "settings",
          JSON.stringify({
            upscaleFactor,
            model: "clarity-upscaler-face-preserve",
            faceEnhance: false,
          }),
        )

        const response = await fetch("/api/enhance-replicate", {
          method: "POST",
          body: formData,
        })

        const result = await response.json()

        if (result.success && result.downloadUrl) {
          setEnhancedImages((prev) =>
            prev.map((img) =>
              img.id === imageId
                ? {
                    ...img,
                    status: "complete",
                    enhanced: result.downloadUrl,
                    downloadUrl: result.downloadUrl,
                  }
                : img,
            ),
          )
        } else {
          throw new Error(result.error || "Enhancement failed")
        }
      } catch (error: any) {
        console.error("Enhancement error:", error)
        setEnhancedImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? {
                  ...img,
                  status: "error",
                  error: error.message || "Failed to enhance image",
                }
              : img,
          ),
        )
      }
    }

    setIsProcessing(false)
  }

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">AI Image Enhancer</h1>
          <p className="text-xl text-gray-300">Transform your images with advanced AI technology</p>
        </div>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="upload">Upload & Enhance</TabsTrigger>
            <TabsTrigger value="results">Enhanced Images</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Upload Images</CardTitle>
                <CardDescription className="text-gray-400">
                  Select images to enhance with AI (max 15MB each)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-white mb-2">Click to upload images</p>
                    <p className="text-sm text-gray-400">PNG, JPG, JPEG up to 15MB</p>
                  </label>
                </div>

                {/* Selected Files */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-white font-medium">Selected Files:</h3>
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                        <span className="text-gray-300">{file.name}</span>
                        <span className="text-gray-400 text-sm">{Math.round(file.size / 1024)}KB</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upscale Factor */}
                <div className="space-y-2">
                  <label className="text-white font-medium">Upscale Factor</label>
                  <select
                    value={upscaleFactor}
                    onChange={(e) => setUpscaleFactor(Number(e.target.value))}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white"
                  >
                    <option value={2}>2x Enhancement</option>
                    <option value={4}>4x Enhancement</option>
                  </select>
                </div>

                {/* Enhance Button */}
                <Button
                  onClick={handleEnhance}
                  disabled={selectedFiles.length === 0 || isProcessing}
                  className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700"
                  size="lg"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Enhance Images
                    </>
                  )}
                </Button>

                {/* Info Alert */}
                <Alert className="border-blue-500/20 bg-blue-900/20">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-200">
                    <strong>Face Preservation Mode:</strong> This mode preserves natural facial features and works well
                    with ASEAN/Indonesian faces.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="results">
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Enhanced Images</CardTitle>
                <CardDescription className="text-gray-400">View and download your enhanced images</CardDescription>
              </CardHeader>
              <CardContent>
                {enhancedImages.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-400">No enhanced images yet</p>
                    <p className="text-gray-500 text-sm mt-2">Upload and enhance images to see results here</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {enhancedImages.map((image) => (
                      <div key={image.id} className="space-y-4">
                        {/* Original */}
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Original</p>
                          <img
                            src={image.original || "/placeholder.svg"}
                            alt="Original"
                            className="w-full rounded-lg"
                          />
                        </div>

                        {/* Enhanced */}
                        <div>
                          <p className="text-gray-400 text-sm mb-2">Enhanced</p>
                          {image.status === "processing" && (
                            <div className="flex items-center justify-center h-48 bg-white/5 rounded-lg">
                              <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                            </div>
                          )}
                          {image.status === "complete" && image.enhanced && (
                            <div className="space-y-2">
                              <img
                                src={image.enhanced || "/placeholder.svg"}
                                alt="Enhanced"
                                className="w-full rounded-lg"
                              />
                              <Button
                                onClick={() => handleDownload(image.downloadUrl!, `enhanced-${Date.now()}.jpg`)}
                                className="w-full"
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                            </div>
                          )}
                          {image.status === "error" && (
                            <Alert className="border-red-500/20 bg-red-900/20">
                              <AlertCircle className="h-4 w-4 text-red-400" />
                              <AlertDescription className="text-red-200">
                                {image.error || "Enhancement failed"}
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
