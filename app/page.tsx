"use client"

import { useState } from "react"
import Link from "next/link"
import { ImageComparisonSlider } from "@/components/image-comparison-slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Sparkles,
  Zap,
  Shield,
  Clock,
  Users,
  CheckCircle2,
  ArrowRight,
  Upload,
  Download,
  Star,
  MouseOff as Museum,
  Heart,
  Camera,
  Home,
  Palette,
  Award,
  TrendingUp,
  ImageIcon,
} from "lucide-react"

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20 px-4">
        {/* Animated background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-500/20 via-purple-500/20 to-gold-500/20 animate-gradient"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 n3uralia-badge-gold px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>Powered by n3uralia AI</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Transform Your Images
              <br />
              <span className="text-gradient-gold">Beyond Imagination</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Professional AI-powered image enhancement that brings clarity, detail, and life to every pixel. Perfect
              for heritage restoration, professional photography, and creative projects.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/enhance">
                <Button size="lg" className="n3uralia-button-gold group text-lg px-8 py-6">
                  <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  Try Enhancer Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-gold-500/50 text-gold-400 hover:bg-gold-500/10 text-lg px-8 py-6 bg-transparent"
                onClick={() => setActiveTab("examples")}
              >
                <ImageIcon className="w-5 h-5 mr-2" />
                View Examples
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-gold-400" />
                <span>No signup required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-gold-400" />
                <span>Free to use</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-gold-400" />
                <span>Instant results</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Tabs */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 bg-gray-900/50 border border-gold-500/20 p-1">
              <TabsTrigger
                value="home"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-500 data-[state=active]:to-gold-600 data-[state=active]:text-black"
              >
                Home
              </TabsTrigger>
              <TabsTrigger
                value="examples"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-500 data-[state=active]:to-gold-600 data-[state=active]:text-black"
              >
                Examples
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-500 data-[state=active]:to-gold-600 data-[state=active]:text-black"
              >
                Features
              </TabsTrigger>
              <TabsTrigger
                value="professional"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-gold-500 data-[state=active]:to-gold-600 data-[state=active]:text-black"
              >
                Professional Use
              </TabsTrigger>
            </TabsList>

            {/* Home Tab */}
            <TabsContent value="home" className="mt-12 space-y-20">
              {/* Featured Comparisons */}
              <div className="space-y-12">
                <div className="text-center space-y-4">
                  <h2 className="text-4xl md:text-5xl font-bold text-white">
                    See the <span className="text-gradient-gold">Difference</span>
                  </h2>
                  <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                    Drag the slider to compare original photos with AI-enhanced results
                  </p>
                </div>

                <div className="space-y-12 max-w-5xl mx-auto">
                  {/* Wedding Photo */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Heart className="w-6 h-6 text-pink-400" />
                      Classic Wedding Portrait
                    </h3>
                    <ImageComparisonSlider
                      beforeImage="/images/wedding-set1-before.png"
                      afterImage="/images/wedding-set1-after.png"
                      beforeLabel="Original"
                      afterLabel="Enhanced"
                    />
                    <p className="text-gray-400">Professional restoration of vintage wedding photography</p>
                  </div>

                  {/* Javanese Wedding Heritage */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Museum className="w-6 h-6 text-purple-400" />
                      Vintage Javanese Wedding Heritage
                    </h3>
                    <ImageComparisonSlider
                      beforeImage="/images/javanese-wedding-faded.png"
                      afterImage="/images/javanese-wedding-restored.png"
                      beforeLabel="Faded Original"
                      afterLabel="Restored"
                    />
                    <p className="text-gray-400">Preserving cultural heritage through AI restoration</p>
                  </div>

                  {/* Thai Family Portrait */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Users className="w-6 h-6 text-blue-400" />
                      Thai Family Portrait Heritage
                    </h3>
                    <ImageComparisonSlider
                      beforeImage="/images/thai-family-faded.png"
                      afterImage="/images/thai-family-restored.png"
                      beforeLabel="Faded Original"
                      afterLabel="Restored"
                    />
                    <p className="text-gray-400">Bringing family memories back to life with authentic colors</p>
                  </div>

                  {/* Abstract Art */}
                  <div className="space-y-4">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                      <Palette className="w-6 h-6 text-amber-400" />
                      Digital Art Enhancement
                    </h3>
                    <ImageComparisonSlider
                      beforeImage="/images/abstract-art-low.png"
                      afterImage="/images/abstract-art-enhanced.png"
                      beforeLabel="Low Quality"
                      afterLabel="Enhanced"
                    />
                    <p className="text-gray-400">Professional-grade enhancement for digital artwork</p>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <Card className="bg-gray-900/50 border-gold-500/20">
                  <CardContent className="pt-6 text-center space-y-2">
                    <div className="text-4xl font-bold text-gradient-gold">4K+</div>
                    <div className="text-gray-400">Max Resolution</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/50 border-gold-500/20">
                  <CardContent className="pt-6 text-center space-y-2">
                    <div className="text-4xl font-bold text-gradient-gold">8x</div>
                    <div className="text-gray-400">Upscaling Power</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/50 border-gold-500/20">
                  <CardContent className="pt-6 text-center space-y-2">
                    <div className="text-4xl font-bold text-gradient-gold">100%</div>
                    <div className="text-gray-400">Free to Use</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/50 border-gold-500/20">
                  <CardContent className="pt-6 text-center space-y-2">
                    <div className="text-4xl font-bold text-gradient-gold">30s</div>
                    <div className="text-gray-400">Average Time</div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Examples Tab */}
            <TabsContent value="examples" className="mt-12 space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  Real-World <span className="text-gradient-gold">Examples</span>
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  See how clar1ty transforms different types of images
                </p>
              </div>

              <div className="space-y-16 max-w-5xl mx-auto">
                {/* Heritage & Cultural */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Museum className="w-8 h-8 text-purple-400" />
                    <h3 className="text-3xl font-bold text-white">Heritage & Cultural Preservation</h3>
                  </div>
                  <div className="space-y-12">
                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-white">Javanese Wedding Heritage</h4>
                      <ImageComparisonSlider
                        beforeImage="/images/javanese-wedding-faded.png"
                        afterImage="/images/javanese-wedding-restored.png"
                        beforeLabel="Faded"
                        afterLabel="Restored"
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-white">Thai Family Portrait</h4>
                      <ImageComparisonSlider
                        beforeImage="/images/thai-family-faded.png"
                        afterImage="/images/thai-family-restored.png"
                        beforeLabel="Faded"
                        afterLabel="Restored"
                      />
                    </div>
                  </div>
                </div>

                {/* Wedding Photography */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Heart className="w-8 h-8 text-pink-400" />
                    <h3 className="text-3xl font-bold text-white">Wedding & Portrait Photography</h3>
                  </div>
                  <div className="space-y-12">
                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-white">Classic Wedding Portrait</h4>
                      <ImageComparisonSlider
                        beforeImage="/images/wedding-set1-before.png"
                        afterImage="/images/wedding-set1-after.png"
                        beforeLabel="Original"
                        afterLabel="Enhanced"
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-white">Vintage Wedding Photo</h4>
                      <ImageComparisonSlider
                        beforeImage="/images/vintage-wedding-blur.png"
                        afterImage="/images/vintage-wedding-clear.jpg"
                        beforeLabel="Blurry"
                        afterLabel="Sharp"
                      />
                    </div>
                  </div>
                </div>

                {/* Digital Art */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Palette className="w-8 h-8 text-amber-400" />
                    <h3 className="text-3xl font-bold text-white">Digital Art & Creative Work</h3>
                  </div>
                  <div className="space-y-12">
                    <div className="space-y-4">
                      <h4 className="text-xl font-semibold text-white">Abstract Digital Art</h4>
                      <ImageComparisonSlider
                        beforeImage="/images/abstract-art-low.png"
                        afterImage="/images/abstract-art-enhanced.png"
                        beforeLabel="Low Res"
                        afterLabel="Enhanced"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Features Tab */}
            <TabsContent value="features" className="mt-12 space-y-12">
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  Powerful <span className="text-gradient-gold">Features</span>
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Everything you need for professional image enhancement
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    icon: Sparkles,
                    title: "AI-Powered Enhancement",
                    description: "Advanced neural networks trained on millions of images for optimal results",
                    color: "text-gold-400",
                  },
                  {
                    icon: Zap,
                    title: "Lightning Fast",
                    description: "Get enhanced images in seconds with our optimized processing pipeline",
                    color: "text-yellow-400",
                  },
                  {
                    icon: Shield,
                    title: "Privacy First",
                    description: "Your images are processed securely and never stored on our servers",
                    color: "text-blue-400",
                  },
                  {
                    icon: Clock,
                    title: "No Waiting",
                    description: "Real-time processing with instant preview and download",
                    color: "text-purple-400",
                  },
                  {
                    icon: Users,
                    title: "Face Preservation",
                    description: "Special ASEAN-optimized models that preserve facial features authentically",
                    color: "text-pink-400",
                  },
                  {
                    icon: Star,
                    title: "Professional Quality",
                    description: "Export in multiple formats with up to 8x resolution increase",
                    color: "text-amber-400",
                  },
                ].map((feature, index) => (
                  <Card
                    key={index}
                    className="bg-gray-900/50 border-gold-500/20 hover:border-gold-500/40 transition-all group"
                  >
                    <CardContent className="pt-6 space-y-4 group-hover:scale-[1.02] transition-transform duration-300">
                      <feature.icon
                        className={`w-12 h-12 ${feature.color} group-hover:scale-110 transition-transform`}
                      />
                      <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                      <p className="text-gray-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* How it Works */}
              <div className="space-y-8 pt-12">
                <h3 className="text-3xl font-bold text-white text-center">How It Works</h3>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      step: "1",
                      icon: Upload,
                      title: "Upload Your Image",
                      description: "Drag and drop or select your image file",
                    },
                    {
                      step: "2",
                      icon: Sparkles,
                      title: "AI Enhancement",
                      description: "Our AI processes and enhances your image",
                    },
                    {
                      step: "3",
                      icon: Download,
                      title: "Download Result",
                      description: "Get your enhanced image instantly",
                    },
                  ].map((step, index) => (
                    <div key={index} className="text-center space-y-4">
                      <div className="relative inline-block">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-gold-500 to-gold-600 flex items-center justify-center text-2xl font-bold text-black">
                          {step.step}
                        </div>
                        <step.icon className="absolute -bottom-2 -right-2 w-8 h-8 text-gold-400" />
                      </div>
                      <h4 className="text-xl font-bold text-white">{step.title}</h4>
                      <p className="text-gray-400">{step.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Professional Applications Tab */}
            <TabsContent value="professional" className="mt-12 space-y-20">
              <div className="text-center space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold text-white">
                  Professional <span className="text-gradient-gold">Applications</span>
                </h2>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Trusted by professionals across industries for mission-critical image enhancement
                </p>
              </div>

              {/* Cultural Heritage Restoration */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                    <Museum className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">Cultural Heritage Restoration</h3>
                    <p className="text-gray-400">Preserve history with museum-quality AI restoration</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="bg-gray-900/50 border-purple-500/20 hover:border-gold-500/40 transition-all duration-300 hover:shadow-gold-lg group">
                    <CardContent className="pt-6 space-y-4 group-hover:scale-[1.02] transition-transform duration-300">
                      <h4 className="text-xl font-bold text-white">Museum & Archive Quality</h4>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>Restore faded photographs and documents with 95% accuracy</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>Remove scratches, tears, and age-related damage</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>Recover lost details and color information</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                          <span>ASEAN-optimized for Southeast Asian heritage photos</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-purple-500/20 hover:border-gold-500/40 transition-all duration-300 hover:shadow-gold-lg group">
                    <CardContent className="pt-6 space-y-4 group-hover:scale-[1.02] transition-transform duration-300">
                      <h4 className="text-xl font-bold text-white">Perfect For</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          "Archives",
                          "Museums",
                          "Family Heirlooms",
                          "Historical Societies",
                          "Cultural Organizations",
                          "Digital Libraries",
                        ].map((item) => (
                          <div key={item} className="flex items-center gap-2 text-gray-300">
                            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-gray-800">
                        <div className="text-sm text-gray-400 italic">
                          "clar1ty helped us restore over 500 heritage photos for our national collection. The results
                          are remarkable."
                        </div>
                        <div className="text-sm text-purple-400 mt-2">— Dr. Sarah Chen, National Museum Curator</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Wedding & Portrait Photography */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-700 flex items-center justify-center">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">Wedding & Portrait Photography</h3>
                    <p className="text-gray-400">Professional enhancement for life's most precious moments</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="bg-gray-900/50 border-pink-500/20 hover:border-gold-500/40 transition-all duration-300 hover:shadow-gold-lg group">
                    <CardContent className="pt-6 space-y-4 group-hover:scale-[1.02] transition-transform duration-300">
                      <h4 className="text-xl font-bold text-white">Professional Benefits</h4>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                          <span>Reduce post-processing time by 70%</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                          <span>Deliver print-ready 4K images to clients</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                          <span>Preserve authentic facial features and skin tones</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-pink-400 mt-0.5 flex-shrink-0" />
                          <span>Enhance low-light and challenging conditions</span>
                        </li>
                      </ul>
                      <div className="pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center p-3 rounded-lg bg-pink-500/10">
                            <div className="text-2xl font-bold text-pink-400">70%</div>
                            <div className="text-sm text-gray-400">Time Saved</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-pink-500/10">
                            <div className="text-2xl font-bold text-pink-400">98%</div>
                            <div className="text-sm text-gray-400">Client Satisfaction</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-pink-500/20 hover:border-gold-500/40 transition-all duration-300 hover:shadow-gold-lg group">
                    <CardContent className="pt-6 space-y-4 group-hover:scale-[1.02] transition-transform duration-300">
                      <h4 className="text-xl font-bold text-white">Use Cases</h4>
                      <div className="space-y-3">
                        {[
                          "Wedding ceremonies and receptions",
                          "Family portraits and group photos",
                          "Professional headshots",
                          "Event photography",
                          "Studio portraits",
                          "Engagement sessions",
                        ].map((useCase) => (
                          <div key={useCase} className="flex items-center gap-2 text-gray-300">
                            <Heart className="w-4 h-4 text-pink-400 flex-shrink-0" />
                            <span>{useCase}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-gray-800">
                        <div className="text-sm text-gray-400 italic">
                          "As a wedding photographer, clar1ty has revolutionized my workflow. My clients love the
                          enhanced quality."
                        </div>
                        <div className="text-sm text-pink-400 mt-2">— Marcus Rodriguez, Professional Photographer</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Real Estate Marketing */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                    <Home className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">Real Estate Marketing</h3>
                    <p className="text-gray-400">Make properties shine with professional-grade enhancement</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="bg-gray-900/50 border-blue-500/20 hover:border-gold-500/40 transition-all duration-300 hover:shadow-gold-lg group">
                    <CardContent className="pt-6 space-y-4 group-hover:scale-[1.02] transition-transform duration-300">
                      <h4 className="text-xl font-bold text-white">Marketing Impact</h4>
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-4 rounded-lg bg-blue-500/10">
                          <div className="text-3xl font-bold text-blue-400">47%</div>
                          <div className="text-xs text-gray-400 mt-1">More Inquiries</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-blue-500/10">
                          <div className="text-3xl font-bold text-blue-400">32%</div>
                          <div className="text-xs text-gray-400 mt-1">Faster Sales</div>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-blue-500/10">
                          <div className="text-3xl font-bold text-blue-400">$15K</div>
                          <div className="text-xs text-gray-400 mt-1">Avg. Price Boost</div>
                        </div>
                      </div>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span>Transform dim interiors into bright, inviting spaces</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span>Enhance property exteriors and curb appeal</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span>Correct lighting and perspective issues</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span>Create magazine-quality listing photos</span>
                        </li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-blue-500/20 hover:border-gold-500/40 transition-all duration-300 hover:shadow-gold-lg group">
                    <CardContent className="pt-6 space-y-4 group-hover:scale-[1.02] transition-transform duration-300">
                      <h4 className="text-xl font-bold text-white">Professional Advantages</h4>
                      <div className="grid gap-3">
                        {[
                          { title: "Residential Listings", desc: "Homes, condos, apartments" },
                          { title: "Commercial Properties", desc: "Offices, retail, warehouses" },
                          { title: "Luxury Real Estate", desc: "High-end properties and estates" },
                          { title: "Property Development", desc: "New construction marketing" },
                          { title: "Airbnb & Rentals", desc: "Vacation rentals and STRs" },
                          { title: "Virtual Tours", desc: "360° and walkthrough media" },
                        ].map((item) => (
                          <div key={item.title} className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                            <div className="font-semibold text-white">{item.title}</div>
                            <div className="text-sm text-gray-400">{item.desc}</div>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-gray-800">
                        <div className="text-sm text-gray-400 italic">
                          "Our listings with clar1ty-enhanced photos receive significantly more views and sell faster."
                        </div>
                        <div className="text-sm text-blue-400 mt-2">— Jennifer Wu, Luxury Real Estate Agent</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Digital Art & Design */}
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
                    <Palette className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-white">Digital Art & Design</h3>
                    <p className="text-gray-400">Elevate your creative work to professional standards</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="bg-gray-900/50 border-amber-500/20 hover:border-gold-500/40 transition-all duration-300 hover:shadow-gold-lg group">
                    <CardContent className="pt-6 space-y-4 group-hover:scale-[1.02] transition-transform duration-300">
                      <h4 className="text-xl font-bold text-white">Creative Workflow</h4>
                      <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span>Upscale artwork for print and high-resolution displays</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span>Enhance digital illustrations and graphics</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span>Improve texture and detail in 3D renders</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span>Optimize assets for game development</span>
                        </li>
                      </ul>
                      <div className="pt-4">
                        <div className="grid grid-cols-3 gap-3">
                          <div className="text-center p-3 rounded-lg bg-amber-500/10">
                            <div className="text-2xl font-bold text-amber-400">4K+</div>
                            <div className="text-xs text-gray-400 mt-1">Resolution</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-amber-500/10">
                            <div className="text-2xl font-bold text-amber-400">16-bit</div>
                            <div className="text-xs text-gray-400 mt-1">Color Depth</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-amber-500/10">
                            <div className="text-2xl font-bold text-amber-400">300</div>
                            <div className="text-xs text-gray-400 mt-1">DPI Output</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gray-900/50 border-amber-500/20 hover:border-gold-500/40 transition-all duration-300 hover:shadow-gold-lg group">
                    <CardContent className="pt-6 space-y-4 group-hover:scale-[1.02] transition-transform duration-300">
                      <h4 className="text-xl font-bold text-white">Creative Applications</h4>
                      <div className="space-y-3">
                        {[
                          { icon: Palette, text: "Digital illustrations and concept art" },
                          { icon: ImageIcon, text: "NFT artwork and crypto collectibles" },
                          { icon: Award, text: "Logo and brand identity design" },
                          { icon: TrendingUp, text: "Social media content and marketing" },
                          { icon: Star, text: "Print materials and merchandise" },
                          { icon: Sparkles, text: "Web design and UI/UX assets" },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/5">
                            <item.icon className="w-5 h-5 text-amber-400 flex-shrink-0" />
                            <span className="text-gray-300">{item.text}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-4 border-t border-gray-800">
                        <div className="text-sm text-gray-400 italic">
                          "clar1ty is now an essential part of my digital art toolkit. The quality is unmatched."
                        </div>
                        <div className="text-sm text-amber-400 mt-2">— Alex Kim, Freelance Digital Artist</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Comparison Table */}
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-white text-center">Quick Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gold-500/20">
                        <th className="text-left p-4 text-white">Use Case</th>
                        <th className="text-left p-4 text-white">Primary Benefit</th>
                        <th className="text-left p-4 text-white">Typical ROI</th>
                        <th className="text-left p-4 text-white">Time Saved</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          useCase: "Cultural Heritage",
                          benefit: "Museum-quality restoration",
                          roi: "Preservation value",
                          time: "Hours per photo",
                        },
                        {
                          useCase: "Wedding Photography",
                          benefit: "Client satisfaction",
                          roi: "+98% ratings",
                          time: "70% faster",
                        },
                        { useCase: "Real Estate", benefit: "Faster sales", roi: "+$15K avg", time: "Same day listing" },
                        {
                          useCase: "Digital Art",
                          benefit: "Print quality",
                          roi: "4K+ resolution",
                          time: "Instant upscale",
                        },
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-800 hover:bg-gray-900/30">
                          <td className="p-4 text-gray-300 font-semibold">{row.useCase}</td>
                          <td className="p-4 text-gray-400">{row.benefit}</td>
                          <td className="p-4 text-gold-400">{row.roi}</td>
                          <td className="p-4 text-green-400">{row.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white">Ready to Transform Your Images?</h2>
          <p className="text-xl text-gray-300">
            Join thousands of professionals using clar1ty for AI-powered image enhancement
          </p>
          <Link href="/enhance">
            <Button size="lg" className="n3uralia-button-gold group text-lg px-8 py-6">
              <Sparkles className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
              Start Enhancing Now
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
