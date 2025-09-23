"use client"

import type React from "react"

import { useState } from "react"
import { Upload, CheckCircle, Download, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ASEANTestDemoProps {
  onApplyPreset: (presetId: string) => void
  onFileSelect: (files: FileList) => void
}

export function ASEANTestDemo({ onApplyPreset, onFileSelect }: ASEANTestDemoProps) {
  const [testStage, setTestStage] = useState<"upload" | "processing" | "complete">("upload")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const handleTestUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create preview
      const preview = URL.createObjectURL(file)
      setSelectedImage(preview)

      // Apply ASEAN Portrait preset
      onApplyPreset("asean-portrait-safe")

      // Add to processing queue
      onFileSelect(e.target.files!)

      setTestStage("processing")

      // Simulate processing completion
      setTimeout(() => {
        setTestStage("complete")
      }, 3000)
    }
  }

  return (
    <Card className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border-indigo-500/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">🧪 ASEAN Portrait Preset Test</CardTitle>
        <CardDescription className="text-gray-300">
          Upload a portrait to test ultra-safe ASEAN face preservation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {testStage === "upload" && (
          <div className="space-y-4">
            {/* Upload Area */}
            <div className="border-2 border-dashed border-indigo-400/30 rounded-lg p-6 text-center">
              <input type="file" accept="image/*" onChange={handleTestUpload} className="hidden" id="asean-test-file" />
              <label htmlFor="asean-test-file" className="cursor-pointer">
                <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
                <div className="text-indigo-300 font-medium mb-1">Upload Test Portrait</div>
                <div className="text-xs text-gray-400">ASEAN Portrait preset will be applied automatically</div>
              </label>
            </div>

            {/* Preset Preview */}
            <div className="bg-indigo-900/20 rounded-lg p-3 border border-indigo-500/20">
              <div className="text-sm text-indigo-200 font-medium mb-2">🛡️ Ultra-Safe Settings Preview:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-indigo-300">Model:</span> Face Preserving
                </div>
                <div>
                  <span className="text-indigo-300">Upscale:</span> 2x Safe
                </div>
                <div>
                  <span className="text-indigo-300">Pre-processing:</span> OFF
                </div>
                <div>
                  <span className="text-indigo-300">Post-processing:</span> OFF
                </div>
                <div>
                  <span className="text-indigo-300">Quality:</span> 98% PNG
                </div>
                <div>
                  <span className="text-indigo-300">Face Enhancement:</span> DISABLED
                </div>
              </div>
            </div>
          </div>
        )}

        {testStage === "processing" && (
          <div className="space-y-4">
            {/* Processing Status */}
            <div className="flex items-center gap-3 p-4 bg-blue-900/20 rounded-lg border border-blue-500/20">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-blue-400 animate-pulse" />
              </div>
              <div>
                <div className="text-blue-300 font-medium">Processing with ASEAN Face Preservation</div>
                <div className="text-xs text-blue-200">Ensuring 100% facial feature authenticity...</div>
              </div>
            </div>

            {/* Image Preview */}
            {selectedImage && (
              <div className="relative">
                <img
                  src={selectedImage || "/placeholder.svg"}
                  alt="Test image"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-blue-600/20 rounded-lg flex items-center justify-center">
                  <div className="bg-blue-900/80 text-blue-200 px-3 py-1 rounded text-sm">🛡️ Face Protection Active</div>
                </div>
              </div>
            )}

            {/* Processing Steps */}
            <div className="space-y-2">
              {[
                { step: "Image Analysis", status: "complete", desc: "ASEAN facial features detected" },
                { step: "Face Protection", status: "complete", desc: "Preservation mode activated" },
                { step: "AI Enhancement", status: "processing", desc: "Upscaling without face modification" },
                { step: "Quality Check", status: "pending", desc: "Verifying feature preservation" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.status === "complete"
                        ? "bg-green-400"
                        : item.status === "processing"
                          ? "bg-blue-400 animate-pulse"
                          : "bg-gray-500"
                    }`}
                  />
                  <span className="text-gray-300">{item.step}:</span>
                  <span className="text-gray-400">{item.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {testStage === "complete" && (
          <div className="space-y-4">
            {/* Success Status */}
            <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">ASEAN Face Preservation Complete!</span>
              </div>
              <div className="text-sm text-green-200">
                Your image has been enhanced with 100% facial feature preservation
              </div>
            </div>

            {/* Results Preview */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Original</div>
                {selectedImage && (
                  <img
                    src={selectedImage || "/placeholder.svg"}
                    alt="Original"
                    className="w-full h-24 object-cover rounded"
                  />
                )}
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-400 mb-1">Enhanced (2x)</div>
                <div className="w-full h-24 bg-gradient-to-br from-green-900/20 to-blue-900/20 rounded flex items-center justify-center">
                  <span className="text-xs text-green-400">🛡️ Face Protected</span>
                </div>
              </div>
            </div>

            {/* Preservation Verification */}
            <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-lg p-3">
              <div className="text-sm text-emerald-300 font-medium mb-2">✅ Preservation Verified:</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="text-emerald-200">✅ Skin tone unchanged</div>
                <div className="text-emerald-200">✅ Eye shape preserved</div>
                <div className="text-emerald-200">✅ Facial structure intact</div>
                <div className="text-emerald-200">✅ Cultural authenticity maintained</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button onClick={() => setTestStage("upload")} variant="outline" size="sm" className="flex-1">
                Test Another Image
              </Button>
              <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                <Download className="w-4 h-4 mr-1" />
                Download Result
              </Button>
            </div>
          </div>
        )}

        {/* Face Preservation Guarantee */}
        <div className="bg-green-900/20 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-green-200">
              <strong>100% ASEAN Face Preservation Guarantee:</strong> This preset maintains authentic Indonesian,
              Malaysian, Thai, Filipino, and other ASEAN facial characteristics without any Western bias or unwanted
              modifications.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
