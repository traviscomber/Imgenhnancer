"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ImageComparisonHybrid } from "@/components/image-comparison-hybrid"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ClarityLogo } from "@/components/clarity-logo"
import {
  Sparkles,
  Zap,
  Shield,
  ImageIcon,
  CheckCircle2,
  ArrowRight,
  Upload,
  Download,
  Camera,
  Building2,
  Church,
} from "lucide-react"
import { trackCTAClick, trackExampleView } from "@/lib/analytics"
import { logout } from "@/lib/auth"

export default function Home() {
  const [activeTab, setActiveTab] = useState("home")
  const router = useRouter()

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === "examples" || tab === "professional") {
      trackExampleView(tab, tab)
    }
  }

  const handleTryEnhancer = async () => {
    trackCTAClick("hero", "Try Enhancer")
    await logout()
    router.push("/enhance")
  }

  const handleGetStarted = async () => {
    trackCTAClick("bottom_cta", "Get Started Free")
    await logout()
    router.push("/enhance")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black">
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center space-y-4 md:space-y-6 mb-12 md:mb-16">
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20 text-xs md:text-sm">
            ✨ AI-Powered Enhancement
          </Badge>
          <div className="flex justify-center mb-6">
            <ClarityLogo className="h-16 md:h-24 lg:h-32 w-auto" />
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
            Transform Your Images with{" "}
            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">AI Magic</span>
          </h1>
          <p className="text-base md:text-lg text-gray-400 max-w-3xl mx-auto px-4">
            Professional-grade image enhancement powered by cutting-edge AI. Restore heritage photos, enhance wedding
            memories, and elevate your creative work.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold px-6 md:px-8 text-sm md:text-base w-full sm:w-auto"
              onClick={handleTryEnhancer}
            >
              Try Enhancer
              <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 text-sm md:text-base w-full sm:w-auto bg-transparent"
              onClick={() => {
                document.getElementById("examples")?.scrollIntoView({ behavior: "smooth" })
                trackCTAClick("hero", "View Examples")
              }}
            >
              View Examples
            </Button>
          </div>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8 md:mb-12 bg-gray-800/50">
            <TabsTrigger value="home" className="text-xs md:text-sm">
              Home
            </TabsTrigger>
            <TabsTrigger value="examples" className="text-xs md:text-sm">
              Examples
            </TabsTrigger>
            <TabsTrigger value="professional" className="text-xs md:text-sm">
              Professional
            </TabsTrigger>
          </TabsList>

          {/* Home Tab - Best Showcases */}
          <TabsContent value="home" className="space-y-12 md:space-y-16">
            {/* Hero Comparison Sliders */}
            <div className="space-y-8 md:space-y-12">
              <div className="text-center space-y-2 md:space-y-3">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">See the Difference</h2>
                <p className="text-sm text-gray-400">Drag the slider to compare before and after</p>
              </div>

              <div className="space-y-6 md:space-y-8">
                {/* Main Wedding Showcase */}
                <ImageComparisonHybrid
                  beforeImage="/images/wedding-before.png"
                  afterImage="/images/wedding-after.png"
                  beforeLabel="Original"
                  afterLabel="AI Enhanced"
                  improvements={["↑ 45% sharper", "↑ 30% brighter", "↑ 60% detail"]}
                />

                {/* Indonesian Heritage */}
                <ImageComparisonHybrid
                  beforeImage="/images/javanese-wedding-faded.png"
                  afterImage="/images/javanese-wedding-restored.png"
                  beforeLabel="Faded Photo"
                  afterLabel="Restored Heritage"
                  improvements={["↑ 50% color accuracy", "↑ 70% contrast", "✓ Heritage preserved"]}
                />

                {/* Vintage Wedding Clarity */}
                <ImageComparisonHybrid
                  beforeImage="/images/vintage-wedding-blur.png"
                  afterImage="/images/vintage-wedding-clear.jpg"
                  beforeLabel="Blurred"
                  afterLabel="Crystal Clear"
                  improvements={["↑ 80% sharpness", "↑ 40% detail", "✓ Noise reduced"]}
                />
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="bg-gray-800/50 border-gray-700 hover:border-amber-500/50 transition-all">
                <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-white">AI Enhancement</h3>
                  <p className="text-xs md:text-sm text-gray-400">
                    Advanced AI algorithms restore and enhance image quality with unprecedented detail.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 hover:border-amber-500/50 transition-all">
                <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-white">Lightning Fast</h3>
                  <p className="text-xs md:text-sm text-gray-400">
                    Process images in seconds with our optimized AI pipeline.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 hover:border-amber-500/50 transition-all">
                <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-white">Face Preservation</h3>
                  <p className="text-xs md:text-sm text-gray-400">
                    Maintains facial features and skin tones for ASEAN portraits.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700 hover:border-amber-500/50 transition-all">
                <CardContent className="p-4 md:p-6 space-y-3 md:space-y-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-amber-500/10 rounded-lg flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-white">High Resolution</h3>
                  <p className="text-xs md:text-sm text-gray-400">
                    Upscale to 4K and beyond without losing quality or detail.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* How It Works */}
            <div className="space-y-6 md:space-y-8">
              <div className="text-center space-y-2 md:space-y-3">
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">How It Works</h2>
                <p className="text-sm text-gray-400">Three simple steps to transform your images</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="text-center space-y-3 md:space-y-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6 md:w-8 md:h-8 text-black" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-white">1. Upload</h3>
                  <p className="text-xs md:text-sm text-gray-400">
                    Upload your image or drag and drop it into the enhancer.
                  </p>
                </div>

                <div className="text-center space-y-3 md:space-y-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-black" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-white">2. Enhance</h3>
                  <p className="text-xs md:text-sm text-gray-400">
                    Our AI processes and enhances your image automatically.
                  </p>
                </div>

                <div className="text-center space-y-3 md:space-y-4">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-full flex items-center justify-center mx-auto">
                    <Download className="w-6 h-6 md:w-8 md:h-8 text-black" />
                  </div>
                  <h3 className="text-base md:text-lg font-semibold text-white">3. Download</h3>
                  <p className="text-xs md:text-sm text-gray-400">Download your enhanced image in high resolution.</p>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Examples Tab - Categorized by Use Case */}
          <TabsContent value="examples" className="space-y-8 md:space-y-12" id="examples">
            <div className="text-center space-y-2 md:space-y-3">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Real Examples</h2>
              <p className="text-sm text-gray-400">See the transformation across different types of images</p>
            </div>

            <div className="space-y-8 md:space-y-12">
              {/* Wedding Photography */}
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <Camera className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                  <h3 className="text-lg md:text-xl font-bold text-white">Wedding Photography</h3>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <ImageComparisonHybrid
                    beforeImage="/images/wedding-before.png"
                    afterImage="/images/wedding-after.png"
                    beforeLabel="Original"
                    afterLabel="Enhanced"
                  />
                  <ImageComparisonHybrid
                    beforeImage="/images/wedding-set1-before.png"
                    afterImage="/images/wedding-set1-after.png"
                    beforeLabel="Before"
                    afterLabel="After"
                  />
                  <ImageComparisonHybrid
                    beforeImage="/images/vintage-wedding-blur.png"
                    afterImage="/images/vintage-wedding-clear.jpg"
                    beforeLabel="Blurred"
                    afterLabel="Crystal Clear"
                  />
                </div>
              </div>

              {/* Cultural Heritage Restoration */}
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <Church className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                  <h3 className="text-lg md:text-xl font-bold text-white">Cultural Heritage Restoration</h3>
                </div>
                <div className="space-y-4 md:space-y-6">
                  <ImageComparisonHybrid
                    beforeImage="/images/javanese-wedding-faded.png"
                    afterImage="/images/javanese-wedding-restored.png"
                    beforeLabel="Faded Photo"
                    afterLabel="Restored"
                  />
                  <ImageComparisonHybrid
                    beforeImage="/images/thai-family-faded.png"
                    afterImage="/images/thai-family-restored.png"
                    beforeLabel="Original"
                    afterLabel="Enhanced"
                  />
                </div>
              </div>

              {/* Real Estate Marketing */}
              <div className="space-y-4 md:space-y-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <Building2 className="w-5 h-5 md:w-6 md:h-6 text-amber-400" />
                  <h3 className="text-lg md:text-xl font-bold text-white">Real Estate Marketing</h3>
                </div>
                <ImageComparisonHybrid
                  beforeImage="/images/real-estate-before.png"
                  afterImage="/images/real-estate-after.png"
                  beforeLabel="Dark Interior"
                  afterLabel="Bright & Inviting"
                />
              </div>
            </div>
          </TabsContent>

          {/* Professional Use Tab */}
          <TabsContent value="professional" className="space-y-8 md:space-y-12">
            <div className="text-center space-y-2 md:space-y-3">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Professional Applications</h2>
              <p className="text-sm text-gray-400">Trusted by professionals across industries</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Wedding Photography */}
              <Card className="bg-gray-800/50 border-pink-500/30 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 transition-all group">
                <CardContent className="p-6 md:p-8 space-y-4 md:space-y-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-500/10 group-hover:bg-amber-500/10 rounded-lg flex items-center justify-center transition-colors">
                    <Camera className="w-6 h-6 md:w-8 md:h-8 text-pink-400 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <h3 className="text-lg md:text-xl font-bold text-white">Wedding Photography</h3>
                    <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                      Professional photographers enhance their wedding portfolios with AI-powered image improvement,
                      delivering flawless memories to clients.
                    </p>
                  </div>
                  <ul className="space-y-2 md:space-y-3">
                    <li className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Batch processing for entire events</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Natural skin tone preservation</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Low-light photo recovery</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Cultural Heritage */}
              <Card className="bg-gray-800/50 border-purple-500/30 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 transition-all group">
                <CardContent className="p-6 md:p-8 space-y-4 md:space-y-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-500/10 group-hover:bg-amber-500/10 rounded-lg flex items-center justify-center transition-colors">
                    <Church className="w-6 h-6 md:w-8 md:h-8 text-purple-400 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <h3 className="text-lg md:text-xl font-bold text-white">Cultural Heritage Preservation</h3>
                    <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                      Museums and archivists use our AI to restore and preserve historical photographs, maintaining
                      cultural authenticity while removing age-related damage.
                    </p>
                  </div>
                  <ul className="space-y-2 md:space-y-3">
                    <li className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400 shrink-0 mt-0.5" />
                      <span>ASEAN-optimized face preservation</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Damage repair and color restoration</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Museum-quality output</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Real Estate */}
              <Card className="bg-gray-800/50 border-blue-500/30 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 transition-all group">
                <CardContent className="p-6 md:p-8 space-y-4 md:space-y-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/10 group-hover:bg-amber-500/10 rounded-lg flex items-center justify-center transition-colors">
                    <Building2 className="w-6 h-6 md:w-8 md:h-8 text-blue-400 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <h3 className="text-lg md:text-xl font-bold text-white">Real Estate Marketing</h3>
                    <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                      Real estate agents transform property photos to attract buyers, turning dim interiors into bright,
                      inviting spaces that sell faster.
                    </p>
                  </div>
                  <ul className="space-y-2 md:space-y-3">
                    <li className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Interior lighting enhancement</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400 shrink-0 mt-0.5" />
                      <span>3X faster listing sales</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Professional-grade results</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Professional Photography */}
              <Card className="bg-gray-800/50 border-green-500/30 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 transition-all group">
                <CardContent className="p-6 md:p-8 space-y-4 md:space-y-6">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500/10 group-hover:bg-amber-500/10 rounded-lg flex items-center justify-center transition-colors">
                    <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-green-400 group-hover:text-amber-400 transition-colors" />
                  </div>
                  <div className="space-y-2 md:space-y-3">
                    <h3 className="text-lg md:text-xl font-bold text-white">Professional Photography</h3>
                    <p className="text-xs md:text-sm text-gray-400 leading-relaxed">
                      Professional photographers enhance their portfolio work, delivering stunning results for
                      commercial clients and personal projects.
                    </p>
                  </div>
                  <ul className="space-y-2 md:space-y-3">
                    <li className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Detail preservation at any scale</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Print-ready output up to 4K</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs md:text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-amber-400 shrink-0 mt-0.5" />
                      <span>Style-aware enhancement</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <div className="mt-16 md:mt-20 text-center space-y-4 md:space-y-6 bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/20 rounded-2xl p-8 md:p-12">
          <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">Ready to Transform Your Images?</h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Join thousands of professionals using clar1ty to enhance their images with AI
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold px-6 md:px-8 text-sm md:text-base"
            onClick={handleGetStarted}
          >
            Get Started Free
            <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  )
}
