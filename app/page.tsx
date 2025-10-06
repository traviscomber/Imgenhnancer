"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ImageComparisonSlider } from "@/components/image-comparison-slider"
import { Sparkles, Upload, Zap, Shield, Globe, Heart, Camera, Palette, Building } from "lucide-react"
import Footer from "@/components/footer"

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState("home")

  return (
    <div className="min-h-screen n3uralia-gradient">
      {/* Header */}
      <header className="n3uralia-card sticky top-0 z-50 border-b n3uralia-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center n3uralia-glow-gold">
                <Sparkles className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-2xl font-bold n3uralia-text-gold">n3uralia</h1>
                <p className="text-xs text-muted-foreground">AI Image Enhancement Platform</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("home")}>
                Home
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("enhance")}>
                Enhance
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab("examples")}>
                Examples
              </Button>
              <Button className="n3uralia-button-gold">Get Started</Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="hidden">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="enhance">Enhance</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-16">
            {/* Hero Section */}
            <section className="text-center space-y-6 py-12">
              <Badge className="n3uralia-badge-gold mx-auto">
                <Sparkles className="w-3 h-3 mr-1" />
                Powered by Advanced AI
              </Badge>
              <h2 className="text-5xl md:text-6xl font-bold n3uralia-text-gold leading-tight">
                Transform Your Images
                <br />
                <span className="text-foreground">With AI Precision</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Professional-grade image enhancement powered by state-of-the-art AI models. Restore, upscale, and
                perfect your photos with a single click.
              </p>
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Button size="lg" className="n3uralia-button-gold" onClick={() => setActiveTab("enhance")}>
                  <Upload className="w-4 h-4 mr-2" />
                  Start Enhancing
                </Button>
                <Button size="lg" variant="outline" onClick={() => setActiveTab("examples")}>
                  View Examples
                </Button>
              </div>
            </section>

            {/* Featured Comparison - Modern Indonesian Wedding */}
            <section className="space-y-6">
              <div className="text-center space-y-2">
                <Badge className="n3uralia-badge-gold">
                  <Heart className="w-3 h-3 mr-1" />
                  ASEAN Focus
                </Badge>
                <h3 className="text-3xl font-bold">🇮🇩 Modern Indonesian Wedding</h3>
                <p className="text-muted-foreground">4x Enhancement • Face Preserved • Traditional Attire</p>
              </div>
              <ImageComparisonSlider
                beforeImage="/images/wedding-before.png"
                afterImage="/images/wedding-after.png"
                beforeLabel="Original"
                afterLabel="4x Enhanced"
                className="max-w-4xl mx-auto"
              />
            </section>

            {/* Vintage ASEAN Wedding Heritage */}
            <section className="space-y-6">
              <div className="text-center space-y-2">
                <Badge className="n3uralia-badge-gold">
                  <Camera className="w-3 h-3 mr-1" />
                  Heritage Restoration
                </Badge>
                <h3 className="text-3xl font-bold">🏛️ Vintage ASEAN Wedding Heritage</h3>
                <p className="text-muted-foreground">Restoration • Cultural Preservation • Authentic Details</p>
              </div>
              <ImageComparisonSlider
                beforeImage="/images/vintage-wedding-blur.png"
                afterImage="/images/vintage-wedding-clear.jpg"
                beforeLabel="Heritage Photo"
                afterLabel="Restored"
                className="max-w-4xl mx-auto"
              />
            </section>

            {/* Core Capabilities */}
            <section className="space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-bold">Core Capabilities</h3>
                <p className="text-muted-foreground">Everything you need for professional image enhancement</p>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="n3uralia-card n3uralia-border hover-card">
                  <CardHeader>
                    <Zap className="w-10 h-10 mb-2 text-gold-500" />
                    <CardTitle>AI Upscaling</CardTitle>
                    <CardDescription>Scale images up to 4x while preserving quality and details</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="n3uralia-card n3uralia-border hover-card">
                  <CardHeader>
                    <Shield className="w-10 h-10 mb-2 text-gold-500" />
                    <CardTitle>Face Preservation</CardTitle>
                    <CardDescription>Advanced algorithms protect facial features during enhancement</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="n3uralia-card n3uralia-border hover-card">
                  <CardHeader>
                    <Sparkles className="w-10 h-10 mb-2 text-gold-500" />
                    <CardTitle>Smart Enhancement</CardTitle>
                    <CardDescription>Automatic optimization based on image content and context</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </section>

            {/* Professional Applications */}
            <section className="space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-bold">Professional Applications</h3>
                <p className="text-muted-foreground">Trusted by professionals across industries</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="n3uralia-card n3uralia-border hover-card text-center">
                  <CardHeader>
                    <Globe className="w-12 h-12 mx-auto mb-2 text-muted-foreground hover:text-gold-500 transition-colors" />
                    <CardTitle className="text-lg">Cultural Heritage</CardTitle>
                    <CardDescription className="text-sm">Restore and preserve historical photographs</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="n3uralia-card n3uralia-border hover-card text-center">
                  <CardHeader>
                    <Camera className="w-12 h-12 mx-auto mb-2 text-muted-foreground hover:text-gold-500 transition-colors" />
                    <CardTitle className="text-lg">Photography</CardTitle>
                    <CardDescription className="text-sm">Enhance wedding and portrait photography</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="n3uralia-card n3uralia-border hover-card text-center">
                  <CardHeader>
                    <Building className="w-12 h-12 mx-auto mb-2 text-muted-foreground hover:text-gold-500 transition-colors" />
                    <CardTitle className="text-lg">Real Estate</CardTitle>
                    <CardDescription className="text-sm">Improve property listing images</CardDescription>
                  </CardHeader>
                </Card>
                <Card className="n3uralia-card n3uralia-border hover-card text-center">
                  <CardHeader>
                    <Palette className="w-12 h-12 mx-auto mb-2 text-muted-foreground hover:text-gold-500 transition-colors" />
                    <CardTitle className="text-lg">Creative Arts</CardTitle>
                    <CardDescription className="text-sm">Enhance artwork and design assets</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </section>

            {/* CTA Section */}
            <section className="text-center space-y-6 py-12 n3uralia-card rounded-2xl n3uralia-border">
              <h3 className="text-3xl font-bold">Ready to Transform Your Images?</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join thousands of professionals who trust n3uralia for their image enhancement needs
              </p>
              <Button size="lg" className="n3uralia-button-gold" onClick={() => setActiveTab("enhance")}>
                <Sparkles className="w-4 h-4 mr-2" />
                Get Started Free
              </Button>
            </section>
          </TabsContent>

          {/* Enhance Tab */}
          <TabsContent value="enhance">
            <Card className="n3uralia-card n3uralia-border">
              <CardHeader>
                <CardTitle>Image Enhancement</CardTitle>
                <CardDescription>Upload your image to get started with AI enhancement</CardDescription>
              </CardHeader>
              <CardContent className="text-center py-12">
                <Upload className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground mb-4">Enhancement feature coming soon</p>
                <Button className="n3uralia-button-gold">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Image
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Examples Tab */}
          <TabsContent value="examples">
            <div className="space-y-8">
              <div className="text-center space-y-2">
                <h3 className="text-3xl font-bold">Enhancement Examples</h3>
                <p className="text-muted-foreground">See the power of AI image enhancement</p>
              </div>
              <div className="grid gap-8">
                <ImageComparisonSlider
                  beforeImage="/images/wedding-before.png"
                  afterImage="/images/wedding-after.png"
                  beforeLabel="Original"
                  afterLabel="Enhanced"
                />
                <ImageComparisonSlider
                  beforeImage="/images/vintage-wedding-blur.png"
                  afterImage="/images/vintage-wedding-clear.jpg"
                  beforeLabel="Before"
                  afterLabel="After"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  )
}
