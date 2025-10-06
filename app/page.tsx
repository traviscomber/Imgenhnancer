"use client"
import Link from "next/link"
import { Sparkles, Zap, Shield, Wand2, Camera, Building2, Palette, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ImageComparisonSlider } from "@/components/image-comparison-slider"
import Footer from "@/components/footer"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/20 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-8 h-8 text-amber-400" />
              <span className="text-2xl font-bold text-white">n3uralia</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/enhance">
                <Button className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700">
                  Try Enhancer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">AI-Powered Image Enhancement</Badge>
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
          Transform Your Images With AI Precision
        </h1>
        <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
          Professional-grade image enhancement powered by advanced AI. Perfect for ASEAN heritage, portraits, and
          creative artwork.
        </p>
        <Link href="/enhance">
          <Button
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white px-8 py-6 text-lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Start Enhancing Free
          </Button>
        </Link>
      </section>

      {/* Main Content Tabs */}
      <section className="container mx-auto px-4 py-12">
        <Tabs defaultValue="home" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-12 bg-black/40 border border-white/10">
            <TabsTrigger
              value="home"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
            >
              Home
            </TabsTrigger>
            <TabsTrigger
              value="examples"
              className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400"
            >
              Examples
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-16">
            {/* Before/After Comparisons */}
            <div className="space-y-12">
              {/* Set 1: Modern Indonesian Wedding */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🇮🇩</span>
                  <h3 className="text-2xl font-bold text-white">Modern Indonesian Wedding</h3>
                </div>
                <p className="text-gray-400">Original photo vs 4x AI-enhanced clarity</p>
                <ImageComparisonSlider
                  beforeImage="/images/wedding-set1-before.png"
                  afterImage="/images/wedding-set1-after.png"
                  beforeLabel="Original"
                  afterLabel="4x Enhanced"
                />
              </div>

              {/* Set 2: Vintage Javanese Wedding Heritage */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🏛️</span>
                  <h3 className="text-2xl font-bold text-white">Vintage Javanese Wedding Heritage</h3>
                </div>
                <p className="text-gray-400">Faded 1920s photo restored to pristine condition</p>
                <ImageComparisonSlider
                  beforeImage="/images/javanese-wedding-faded.png"
                  afterImage="/images/javanese-wedding-restored.png"
                  beforeLabel="Faded Original"
                  afterLabel="AI Restored"
                />
              </div>

              {/* Set 3: Thai Family Portrait */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🇹🇭</span>
                  <h3 className="text-2xl font-bold text-white">Thai Family Portrait Heritage</h3>
                </div>
                <p className="text-gray-400">Damaged 1930s family photo digitally restored</p>
                <ImageComparisonSlider
                  beforeImage="/images/thai-family-faded.png"
                  afterImage="/images/thai-family-restored.png"
                  beforeLabel="Damaged Original"
                  afterLabel="Fully Restored"
                />
              </div>

              {/* Set 4: Abstract Digital Art - NEW */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🎨</span>
                  <h3 className="text-2xl font-bold text-white">Abstract Digital Art</h3>
                </div>
                <p className="text-gray-400">Low-quality artwork enhanced with vibrant colors and sharp details</p>
                <ImageComparisonSlider
                  beforeImage="/images/abstract-art-low.png"
                  afterImage="/images/abstract-art-enhanced.png"
                  beforeLabel="Low Quality"
                  afterLabel="AI Enhanced"
                />
              </div>
            </div>

            {/* Core Capabilities */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="bg-black/40 border-white/10 hover:border-amber-500/30 transition-all">
                <CardHeader>
                  <Zap className="w-12 h-12 text-amber-400 mb-4" />
                  <CardTitle className="text-white">AI Upscaling</CardTitle>
                  <CardDescription className="text-gray-400">
                    Enhance resolution up to 4x while preserving natural details and textures
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-black/40 border-white/10 hover:border-amber-500/30 transition-all">
                <CardHeader>
                  <Shield className="w-12 h-12 text-amber-400 mb-4" />
                  <CardTitle className="text-white">Face Preservation</CardTitle>
                  <CardDescription className="text-gray-400">
                    Maintains authentic facial features, optimized for ASEAN and Indonesian faces
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="bg-black/40 border-white/10 hover:border-amber-500/30 transition-all">
                <CardHeader>
                  <Wand2 className="w-12 h-12 text-amber-400 mb-4" />
                  <CardTitle className="text-white">Smart Enhancement</CardTitle>
                  <CardDescription className="text-gray-400">
                    Intelligent color correction, noise reduction, and detail enhancement
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            {/* Professional Applications */}
            <div>
              <h2 className="text-3xl font-bold text-white text-center mb-8">Professional Applications</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <Card className="bg-black/40 border-white/10 hover:border-amber-500/30 transition-all group">
                  <CardHeader className="text-center">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400 group-hover:text-amber-400 transition-colors" />
                    <CardTitle className="text-white">Cultural Heritage</CardTitle>
                    <CardDescription className="text-gray-400">
                      Restore and preserve historical photos and cultural artifacts
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-black/40 border-white/10 hover:border-amber-500/30 transition-all group">
                  <CardHeader className="text-center">
                    <Camera className="w-12 h-12 mx-auto mb-4 text-gray-400 group-hover:text-amber-400 transition-colors" />
                    <CardTitle className="text-white">Photography</CardTitle>
                    <CardDescription className="text-gray-400">
                      Enhance wedding, portrait, and event photography
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-black/40 border-white/10 hover:border-amber-500/30 transition-all group">
                  <CardHeader className="text-center">
                    <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-400 group-hover:text-amber-400 transition-colors" />
                    <CardTitle className="text-white">Real Estate</CardTitle>
                    <CardDescription className="text-gray-400">
                      Improve property photos for listings and marketing
                    </CardDescription>
                  </CardHeader>
                </Card>

                <Card className="bg-black/40 border-white/10 hover:border-amber-500/30 transition-all group">
                  <CardHeader className="text-center">
                    <Palette className="w-12 h-12 mx-auto mb-4 text-gray-400 group-hover:text-amber-400 transition-colors" />
                    <CardTitle className="text-white">Creative Arts</CardTitle>
                    <CardDescription className="text-gray-400">
                      Enhance digital art, illustrations, and creative projects
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>

            {/* CTA Section */}
            <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-600/10 border-amber-500/30">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your Images?</h2>
                <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                  Join thousands of photographers and content creators using our AI-powered enhancement tools
                </p>
                <Link href="/enhance">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white px-8 py-6 text-lg"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Enhancing Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-12">
            {/* Wedding & Portrait Photography */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">💕</span>
                <h3 className="text-3xl font-bold text-white">Wedding & Portrait Photography</h3>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-xl text-gray-300 mb-3">Modern Indonesian Wedding</h4>
                  <ImageComparisonSlider
                    beforeImage="/images/wedding-set1-before.png"
                    afterImage="/images/wedding-set1-after.png"
                    beforeLabel="Original"
                    afterLabel="4x Enhanced"
                  />
                </div>
              </div>
            </div>

            {/* Cultural Heritage & Restoration */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🌍</span>
                <h3 className="text-3xl font-bold text-white">Cultural Heritage & Restoration</h3>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-xl text-gray-300 mb-3">Vintage Javanese Wedding Heritage (1920s)</h4>
                  <ImageComparisonSlider
                    beforeImage="/images/javanese-wedding-faded.png"
                    afterImage="/images/javanese-wedding-restored.png"
                    beforeLabel="Faded Original"
                    afterLabel="AI Restored"
                  />
                </div>

                <div>
                  <h4 className="text-xl text-gray-300 mb-3">Thai Family Portrait (1930s)</h4>
                  <ImageComparisonSlider
                    beforeImage="/images/thai-family-faded.png"
                    afterImage="/images/thai-family-restored.png"
                    beforeLabel="Damaged Original"
                    afterLabel="Fully Restored"
                  />
                </div>
              </div>
            </div>

            {/* Digital Art & Creative Works - NEW */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">🎨</span>
                <h3 className="text-3xl font-bold text-white">Digital Art & Creative Works</h3>
              </div>

              <div className="space-y-8">
                <div>
                  <h4 className="text-xl text-gray-300 mb-3">Abstract Digital Art</h4>
                  <ImageComparisonSlider
                    beforeImage="/images/abstract-art-low.png"
                    afterImage="/images/abstract-art-enhanced.png"
                    beforeLabel="Low Quality"
                    afterLabel="AI Enhanced"
                  />
                </div>
              </div>
            </div>

            {/* CTA */}
            <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-600/10 border-amber-500/30">
              <CardContent className="p-12 text-center">
                <h2 className="text-3xl font-bold text-white mb-4">Want Results Like These?</h2>
                <p className="text-gray-300 mb-6">Start enhancing your images with professional AI technology</p>
                <Link href="/enhance">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Try It Now
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </section>

      <Footer />
    </div>
  )
}
