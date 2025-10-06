"use client"

import { useState } from "react"
import { Sparkles, Heart, Palette, Zap, Home, Users, Building2, Camera, ImageIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ImageComparisonSlider } from "@/components/image-comparison-slider"
import Link from "next/link"

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("home")

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={scrollToTop} className="flex items-center space-x-2 group cursor-pointer">
              <Sparkles className="w-8 h-8 text-amber-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-amber-300" />
              <span className="text-2xl font-bold text-white transition-all duration-300 group-hover:text-amber-400">
                clar1ty
              </span>
            </button>
            <Link href="/enhance">
              <Button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/50">
                Try Enhancer
                <Sparkles className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-6 bg-amber-500/20 text-amber-400 border-amber-500/30 px-4 py-2 text-sm">
            Powered by Replicate AI
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
            AI Image Enhancement
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Transform your images with professional-grade AI enhancement using Replicate technology
          </p>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="pb-20 px-4">
        <div className="container mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 mb-12 bg-black/40 border border-white/10 p-1">
              <TabsTrigger
                value="home"
                className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 transition-all duration-300"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Home
              </TabsTrigger>
              <TabsTrigger
                value="examples"
                className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 transition-all duration-300"
              >
                <ImageIcon className="w-4 h-4 mr-2" />
                Examples
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 transition-all duration-300"
              >
                <Zap className="w-4 h-4 mr-2" />
                Features
              </TabsTrigger>
              <TabsTrigger
                value="professional"
                className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 transition-all duration-300"
              >
                <Building2 className="w-4 h-4 mr-2" />
                Professional Use
              </TabsTrigger>
            </TabsList>

            {/* Home Tab */}
            <TabsContent value="home" className="space-y-12">
              <div className="max-w-5xl mx-auto space-y-12">
                {/* Wedding Portrait */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Heart className="w-6 h-6 text-rose-400" />
                    <h3 className="text-2xl font-bold text-white">Classic Wedding Portrait Enhancement</h3>
                  </div>
                  <p className="text-gray-300 mb-6">
                    Restore precious wedding memories with AI-powered enhancement. Bring clarity to cherished moments.
                  </p>
                  <ImageComparisonSlider
                    beforeImage="/images/wedding-set1-before.png"
                    afterImage="/images/wedding-set1-after.png"
                    beforeLabel="Original Photo"
                    afterLabel="AI Enhanced"
                  />
                </div>

                {/* Javanese Wedding Heritage */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="w-6 h-6 text-amber-400" />
                    <h3 className="text-2xl font-bold text-white">Vintage Javanese Wedding Heritage</h3>
                  </div>
                  <p className="text-gray-300 mb-6">
                    Preserve cultural heritage with authentic restoration. Specialized for ASEAN traditional
                    photography.
                  </p>
                  <ImageComparisonSlider
                    beforeImage="/images/javanese-wedding-faded.png"
                    afterImage="/images/javanese-wedding-restored.png"
                    beforeLabel="Faded Heritage"
                    afterLabel="Restored Treasure"
                  />
                </div>

                {/* Thai Family Portrait */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Users className="w-6 h-6 text-blue-400" />
                    <h3 className="text-2xl font-bold text-white">Thai Family Portrait Heritage</h3>
                  </div>
                  <p className="text-gray-300 mb-6">
                    Bring family history back to life with natural color restoration and authentic detail preservation.
                  </p>
                  <ImageComparisonSlider
                    beforeImage="/images/thai-family-faded.png"
                    afterImage="/images/thai-family-restored.png"
                    beforeLabel="Faded Memories"
                    afterLabel="Vibrant History"
                  />
                </div>

                {/* Real Estate Interior */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Home className="w-6 h-6 text-blue-500" />
                    <h3 className="text-2xl font-bold text-white">Real Estate Interior Marketing</h3>
                  </div>
                  <p className="text-gray-300 mb-6">
                    Transform property photos into magazine-quality listings. Professional enhancement for faster sales.
                  </p>
                  <ImageComparisonSlider
                    beforeImage="/images/real-estate-before.png"
                    afterImage="/images/real-estate-after.png"
                    beforeLabel="Vintage Photo"
                    afterLabel="Enhanced"
                  />
                </div>

                {/* Digital Art */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 mb-4">
                    <Palette className="w-6 h-6 text-purple-400" />
                    <h3 className="text-2xl font-bold text-white">Digital Art Enhancement</h3>
                  </div>
                  <p className="text-gray-300 mb-6">
                    Elevate digital artwork with professional-grade upscaling. Perfect for prints and high-resolution
                    displays.
                  </p>
                  <ImageComparisonSlider
                    beforeImage="/images/abstract-art-low.png"
                    afterImage="/images/abstract-art-enhanced.png"
                    beforeLabel="Low Resolution"
                    afterLabel="High Definition"
                  />
                </div>
              </div>

              {/* CTA Section */}
              <div className="text-center mt-16">
                <Link href="/enhance">
                  <Button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white px-8 py-6 text-lg transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/50">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Enhancing Your Images
                  </Button>
                </Link>
              </div>
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="space-y-12">
              <div className="max-w-5xl mx-auto space-y-16">
                {/* Heritage Photography Section */}
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Cultural Heritage</Badge>
                    <h2 className="text-3xl font-bold text-white">ASEAN Heritage Photo Restoration</h2>
                    <p className="text-gray-400">Preserve cultural memories with authentic restoration technology</p>
                  </div>

                  <div className="space-y-12">
                    {/* Javanese Wedding */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white">Traditional Javanese Wedding Ceremony</h3>
                      <ImageComparisonSlider
                        beforeImage="/images/javanese-wedding-faded.png"
                        afterImage="/images/javanese-wedding-restored.png"
                        beforeLabel="Faded Original"
                        afterLabel="Restored Heritage"
                      />
                    </div>

                    {/* Thai Family */}
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold text-white">Thai Family Portrait</h3>
                      <ImageComparisonSlider
                        beforeImage="/images/thai-family-faded.png"
                        afterImage="/images/thai-family-restored.png"
                        beforeLabel="Faded Photograph"
                        afterLabel="Restored Memory"
                      />
                    </div>
                  </div>

                  <Card className="bg-gradient-to-br from-amber-900/20 to-yellow-900/20 border-amber-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Sparkles className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="text-white font-semibold mb-2">Heritage Preservation Excellence</h4>
                          <p className="text-gray-300 text-sm">
                            Our Replicate AI technology specializes in ASEAN cultural photography, maintaining authentic
                            skin tones, traditional attire details, and cultural significance while removing age-related
                            degradation.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Real Estate Marketing Section */}
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Real Estate Marketing</Badge>
                    <h2 className="text-3xl font-bold text-white">Professional Property Enhancement</h2>
                    <p className="text-gray-400">Transform listings with magazine-quality photography</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Interior Space Transformation</h3>
                    <ImageComparisonSlider
                      beforeImage="/images/real-estate-before.png"
                      afterImage="/images/real-estate-after.png"
                      beforeLabel="Vintage Photo"
                      afterLabel="Enhanced"
                    />
                  </div>

                  <Card className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border-blue-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Home className="w-6 h-6 text-blue-400 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="text-white font-semibold mb-2">Professional Marketing Impact</h4>
                          <p className="text-gray-300 text-sm mb-3">
                            Properties with enhanced photos receive 47% more inquiries and sell 32% faster with an
                            average price boost of $15,000. Our Replicate technology corrects lighting, enhances colors,
                            and creates magazine-quality results.
                          </p>
                          <div className="grid grid-cols-3 gap-4 mt-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">47%</div>
                              <div className="text-xs text-gray-400">More Inquiries</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">32%</div>
                              <div className="text-xs text-gray-400">Faster Sales</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-400">$15K</div>
                              <div className="text-xs text-gray-400">Avg. Price Boost</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Digital Art Section */}
                <div className="space-y-8">
                  <div className="text-center space-y-2">
                    <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">Digital Art</Badge>
                    <h2 className="text-3xl font-bold text-white">Creative Upscaling</h2>
                    <p className="text-gray-400">Professional-grade enhancement for digital artwork</p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-white">Abstract Art Enhancement</h3>
                    <ImageComparisonSlider
                      beforeImage="/images/abstract-art-low.png"
                      afterImage="/images/abstract-art-enhanced.png"
                      beforeLabel="Low Resolution"
                      afterLabel="High Definition"
                    />
                  </div>

                  <Card className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-purple-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Palette className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
                        <div>
                          <h4 className="text-white font-semibold mb-2">Professional Art Processing</h4>
                          <p className="text-gray-300 text-sm">
                            Perfect for digital artists, designers, and creators. Our Replicate AI maintains artistic
                            intent while dramatically increasing resolution for prints, displays, and professional
                            portfolios.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="space-y-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-white mb-4">Powerful Features</h2>
                  <p className="text-gray-400">Professional-grade enhancement powered by Replicate AI</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="bg-black/40 border-white/10 hover:border-amber-500/30 transition-all duration-300">
                    <CardHeader>
                      <Zap className="w-8 h-8 text-amber-400 mb-2" />
                      <CardTitle className="text-white">AI-Powered Upscaling</CardTitle>
                      <CardDescription className="text-gray-400">
                        Advanced algorithms enhance resolution while preserving details
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="bg-black/40 border-white/10 hover:border-amber-500/30 transition-all duration-300">
                    <CardHeader>
                      <Sparkles className="w-8 h-8 text-amber-400 mb-2" />
                      <CardTitle className="text-white">Smart Enhancement</CardTitle>
                      <CardDescription className="text-gray-400">
                        Automatically detects and enhances key features in your images
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="bg-black/40 border-white/10 hover:border-amber-500/30 transition-all duration-300">
                    <CardHeader>
                      <Camera className="w-8 h-8 text-amber-400 mb-2" />
                      <CardTitle className="text-white">Face Preservation</CardTitle>
                      <CardDescription className="text-gray-400">
                        Specialized face enhancement maintains natural features
                      </CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="bg-black/40 border-white/10 hover:border-amber-500/30 transition-all duration-300">
                    <CardHeader>
                      <ImageIcon className="w-8 h-8 text-amber-400 mb-2" />
                      <CardTitle className="text-white">Batch Processing</CardTitle>
                      <CardDescription className="text-gray-400">
                        Enhance multiple images efficiently with Replicate technology
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Professional Use Tab */}
            <TabsContent value="professional" className="space-y-8">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold text-white mb-4">Professional Applications</h2>
                  <p className="text-gray-400">Trusted by professionals across industries</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Cultural Heritage */}
                  <Card className="group bg-black/40 border-white/10 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="relative">
                      <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Users className="w-6 h-6 text-amber-400" />
                      </div>
                      <CardTitle className="text-white group-hover:text-amber-400 transition-colors duration-300">
                        Cultural Heritage
                      </CardTitle>
                      <CardDescription className="text-gray-400">Museum-quality photo restoration</CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-3">
                      <div className="space-y-2 text-gray-300">
                        <p className="flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          <span>Preserve family and cultural heritage photos</span>
                        </p>
                        <p className="flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          <span>ASEAN-specialized restoration technology</span>
                        </p>
                        <p className="flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          <span>Maintain authentic skin tones and details</span>
                        </p>
                        <p className="flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          <span>Perfect for museums and archives</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Wedding Photography */}
                  <Card className="group bg-black/40 border-white/10 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="relative">
                      <div className="w-12 h-12 rounded-lg bg-rose-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Heart className="w-6 h-6 text-rose-400" />
                      </div>
                      <CardTitle className="text-white group-hover:text-amber-400 transition-colors duration-300">
                        Wedding Photography
                      </CardTitle>
                      <CardDescription className="text-gray-400">Professional wedding enhancement</CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-3">
                      <div className="space-y-2 text-gray-300">
                        <p className="flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          <span>Enhance precious wedding memories</span>
                        </p>
                        <p className="flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          <span>Correct lighting and exposure issues</span>
                        </p>
                        <p className="flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          <span>Restore vintage wedding photographs</span>
                        </p>
                        <p className="flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          <span>Professional-grade results for albums</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Real Estate */}
                  <Card className="group bg-black/40 border-white/10 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="relative">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Home className="w-6 h-6 text-blue-400" />
                      </div>
                      <CardTitle className="text-white group-hover:text-amber-400 transition-colors duration-300">
                        Real Estate
                      </CardTitle>
                      <CardDescription className="text-gray-400">Property marketing enhancement</CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-3">
                      <div className="space-y-2 text-gray-300">
                        <p className="flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          <span>47% increase in property inquiries</span>
                        </p>
                        <p className="flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          <span>32% faster sale times on average</span>
                        </p>
                        <p className="flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          <span>Magazine-quality listing photos</span>
                        </p>
                        <p className="flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          <span>$15K average price boost per property</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Digital Art */}
                  <Card className="group bg-black/40 border-white/10 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="relative">
                      <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Palette className="w-6 h-6 text-purple-400" />
                      </div>
                      <CardTitle className="text-white group-hover:text-amber-400 transition-colors duration-300">
                        Digital Art
                      </CardTitle>
                      <CardDescription className="text-gray-400">Creative workflow enhancement</CardDescription>
                    </CardHeader>
                    <CardContent className="relative space-y-3">
                      <div className="space-y-2 text-gray-300">
                        <p className="flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          <span>Upscale artwork for high-res prints</span>
                        </p>
                        <p className="flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          <span>Maintain artistic style and intent</span>
                        </p>
                        <p className="flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          <span>Perfect for portfolios and exhibitions</span>
                        </p>
                        <p className="flex items-start">
                          <span className="text-amber-400 mr-2">•</span>
                          <span>Professional-grade detail enhancement</span>
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span className="text-white font-bold">clar1ty</span>
            </div>
            <p className="text-gray-400 text-sm">© 2025 clar1ty. Powered by Replicate AI.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
