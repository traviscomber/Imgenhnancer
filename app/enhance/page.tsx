"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { Upload, Sparkles, Download, Loader2, ArrowLeft, Shield, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

type EnhancedImage = {
  id: string
  url: string
  originalUrl: string
}

export default function EnhancePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [enhancedImages, setEnhancedImages] = useState<EnhancedImage[]>([])
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [upscaleFactor, setUpscaleFactor] = useState(2)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setSelectedFiles(files)

    // Create preview URLs
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setPreviews(newPreviews)

    toast({
      title: "Images Selected",
      description: `${files.length} image${files.length > 1 ? "s" : ""} ready to enhance`,
    })
  }

  const handleEnhance = async () => {
    if (selectedFiles.length === 0) {
      toast({
        title: "No Images Selected",
        description: "Please select at least one image to enhance",
        variant: "destructive",
      })
      return
    }

    setIsEnhancing(true)
    setProgress(0)
    const newEnhancedImages: EnhancedImage[] = []

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i]
        setProgress(Math.round(((i + 1) / selectedFiles.length) * 100))

        const formData = new FormData()
        formData.append("image", file)
        formData.append("scale", upscaleFactor.toString())

        console.log("Sending to Replicate API with scale:", upscaleFactor)

        const response = await fetch("/api/enhance-replicate", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          console.error("API Error:", errorData)
          throw new Error(errorData.error || `Failed to enhance image ${i + 1}`)
        }

        const data = await response.json()
        console.log("API Response:", data)

        if (!data.output) {
          throw new Error("No output URL in response")
        }

        newEnhancedImages.push({
          id: `enhanced-${Date.now()}-${i}`,
          url: data.output,
          originalUrl: previews[i],
        })
      }

      setEnhancedImages(newEnhancedImages)
      toast({
        title: "Enhancement Complete!",
        description: `Successfully enhanced ${selectedFiles.length} image${selectedFiles.length > 1 ? "s" : ""}`,
      })
    } catch (error) {
      console.error("Enhancement error:", error)
      toast({
        title: "Enhancement Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsEnhancing(false)
      setProgress(0)
    }
  }

  const handleDownload = async (url: string, index: number) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `enhanced-image-${index + 1}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)

      toast({
        title: "Download Started",
        description: "Your enhanced image is downloading",
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the image",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 group">
              <Sparkles className="w-8 h-8 text-amber-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-amber-300" />
              <span className="text-2xl font-bold text-white transition-all duration-300 group-hover:text-amber-400">
                clar1ty
              </span>
            </Link>
            <Link href="/">
              <Button
                variant="ghost"
                className="text-white hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-300"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">Powered by Replicate AI</Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
            Enhance Your Images
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Upload your images and let Replicate AI enhance them with professional quality
          </p>
        </div>

        <Tabs defaultValue="upload" className="w-full max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-black/40 border border-white/10">
            <TabsTrigger
              value="upload"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload & Enhance
            </TabsTrigger>
            <TabsTrigger
              value="enhanced"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Enhanced Images ({enhancedImages.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-8">
            {/* Settings Card */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Wand2 className="w-5 h-5 mr-2 text-amber-400" />
                  Enhancement Settings
                </CardTitle>
                <CardDescription className="text-gray-400">Configure your image enhancement parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {/* Upscale Factor */}
                  <div className="space-y-2">
                    <Label className="text-white">Upscale Factor: {upscaleFactor}x</Label>
                    <Slider
                      value={[upscaleFactor]}
                      onValueChange={(value) => setUpscaleFactor(value[0])}
                      min={2}
                      max={4}
                      step={1}
                      className="w-full"
                    />
                    <p className="text-sm text-gray-400">
                      Higher values produce larger, more detailed images but take longer to process
                    </p>
                  </div>
                </div>

                <Alert className="bg-amber-500/10 border-amber-500/30">
                  <Shield className="w-4 h-4 text-amber-400" />
                  <AlertDescription className="text-gray-300">
                    Using Replicate AI for maximum quality enhancement with face preservation technology. Perfect for
                    portraits, real estate, and professional photography.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Upload Area */}
            <Card className="bg-black/40 border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Upload Images</CardTitle>
                <CardDescription className="text-gray-400">Select one or more images to enhance</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 rounded-lg p-12 text-center hover:border-amber-500/50 transition-all duration-300 cursor-pointer bg-black/20 hover:bg-black/30"
                >
                  <Upload className="w-12 h-12 text-amber-400 mx-auto mb-4 transition-transform duration-300 hover:scale-110" />
                  <p className="text-white mb-2">Click to upload or drag and drop</p>
                  <p className="text-gray-400 text-sm">PNG, JPG, WEBP (Max 10MB per image)</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {/* Preview Grid */}
                {previews.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {previews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative aspect-square rounded-lg overflow-hidden border border-white/10 hover:border-amber-500/30 transition-all duration-300 hover:scale-105"
                      >
                        <Image
                          src={preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-2">
                          <span className="text-white text-sm">Image {index + 1}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Enhance Button */}
                {previews.length > 0 && (
                  <div className="mt-6">
                    <Button
                      onClick={handleEnhance}
                      disabled={isEnhancing}
                      className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white py-6 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/50"
                    >
                      {isEnhancing ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Enhancing... {progress}%
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5 mr-2" />
                          Enhance {selectedFiles.length} Image{selectedFiles.length > 1 ? "s" : ""}
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enhanced" className="space-y-6">
            {enhancedImages.length === 0 ? (
              <Card className="bg-black/40 border-white/10">
                <CardContent className="p-12 text-center">
                  <Sparkles className="w-16 h-16 text-amber-400 mx-auto mb-4 opacity-50" />
                  <p className="text-white text-lg mb-2">No Enhanced Images Yet</p>
                  <p className="text-gray-400">Upload and enhance images to see them here</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {enhancedImages.map((enhanced, index) => (
                  <Card
                    key={enhanced.id}
                    className="bg-black/40 border-white/10 overflow-hidden hover:border-amber-500/30 transition-all duration-300"
                  >
                    <CardHeader>
                      <CardTitle className="text-white text-lg">Enhanced Image {index + 1}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Before/After Comparison */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <p className="text-gray-400 text-sm">Original</p>
                          <div className="relative aspect-square rounded-lg overflow-hidden border border-white/10">
                            <Image
                              src={enhanced.originalUrl || "/placeholder.svg"}
                              alt="Original"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-amber-400 text-sm">Enhanced</p>
                          <div className="relative aspect-square rounded-lg overflow-hidden border border-amber-500/30">
                            <Image
                              src={enhanced.url || "/placeholder.svg"}
                              alt="Enhanced"
                              fill
                              className="object-cover"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Download Button */}
                      <Button
                        onClick={() => handleDownload(enhanced.url, index)}
                        className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/50"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Enhanced
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
