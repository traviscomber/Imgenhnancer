import {
  Brain,
  Shield,
  Cpu,
  Globe,
  Mail,
  MapPin,
  Github,
  Twitter,
  Linkedin,
  ArrowRight,
  Sparkles,
  Heart,
  Award,
  Users,
  Zap,
} from "lucide-react"

const Footer = () => {
  return (
    <footer className="n3uralia-card border-t n3uralia-border mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center n3uralia-glow">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">n3uralia</h3>
                <p className="text-sm n3uralia-text-muted">AI Image Enhancement Platform</p>
              </div>
            </div>
            <p className="n3uralia-text-muted text-sm leading-relaxed mb-6 max-w-md">
              Advanced AI image enhancement platform with specialized ASEAN face preservation technology. Transform your
              images while maintaining cultural authenticity and natural beauty.
            </p>

            {/* Status Indicators */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center space-x-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-white n3uralia-pulse"></div>
                <span className="text-white">AI Models Online</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Shield className="w-4 h-4 text-white/70" />
                <span className="text-white/70">Face Preservation Active</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Award className="w-4 h-4 text-white/70" />
                <span className="text-white/70">ASEAN Certified</span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Stay Updated
              </h4>
              <p className="text-sm n3uralia-text-muted mb-3">
                Get the latest updates on AI enhancement technology and ASEAN-focused features.
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 bg-white/10 border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button className="n3uralia-button-primary px-4 py-2 rounded-md text-sm flex items-center gap-1">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Capabilities
            </h4>
            <ul className="space-y-3 text-sm n3uralia-text-muted">
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <div className="w-1 h-1 rounded-full bg-white/50"></div>
                AI Image Enhancement
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <div className="w-1 h-1 rounded-full bg-white/50"></div>
                ASEAN Face Preservation
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <div className="w-1 h-1 rounded-full bg-white/50"></div>
                4x Upscaling Technology
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <div className="w-1 h-1 rounded-full bg-white/50"></div>
                Domemaster Export
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <div className="w-1 h-1 rounded-full bg-white/50"></div>
                Batch Processing
              </li>
              <li className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer">
                <div className="w-1 h-1 rounded-full bg-white/50"></div>
                Cultural Sensitivity AI
              </li>
            </ul>
          </div>

          {/* Support & Resources */}
          <div>
            <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Support & Resources
            </h4>
            <ul className="space-y-3 text-sm n3uralia-text-muted">
              <li className="hover:text-white transition-colors cursor-pointer">Documentation</li>
              <li className="hover:text-white transition-colors cursor-pointer">API Reference</li>
              <li className="hover:text-white transition-colors cursor-pointer">ASEAN Guidelines</li>
              <li className="hover:text-white transition-colors cursor-pointer">Community Forum</li>
              <li className="hover:text-white transition-colors cursor-pointer">Contact Support</li>
              <li className="hover:text-white transition-colors cursor-pointer">Status Page</li>
            </ul>

            {/* Contact Info */}
            <div className="mt-6 space-y-2 text-xs n3uralia-text-muted">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>Southeast Asia</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3 h-3" />
                <span>support@n3uralia.ai</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3 h-3" />
                <span>24/7 AI Processing</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-white mb-1">100%</div>
            <div className="text-xs n3uralia-text-muted">Face Preservation</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-white mb-1">4x</div>
            <div className="text-xs n3uralia-text-muted">Max Upscaling</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-white mb-1">8K</div>
            <div className="text-xs n3uralia-text-muted">Domemaster Output</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center border border-white/10">
            <div className="text-2xl font-bold text-white mb-1">ASEAN</div>
            <div className="text-xs n3uralia-text-muted">Specialized</div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div className="flex items-center space-x-4">
            <span className="text-sm n3uralia-text-muted">Follow n3uralia:</span>
            <div className="flex space-x-3">
              <button className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Twitter className="w-4 h-4 text-white/70" />
              </button>
              <button className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Github className="w-4 h-4 text-white/70" />
              </button>
              <button className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/20 transition-colors">
                <Linkedin className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <span className="n3uralia-text-muted">Powered by</span>
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-white/70" />
              <span className="text-white/70">Clarity Upscaler AI</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-white/70" />
              <span className="text-white/70">Replicate Infrastructure</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="n3uralia-divider mb-8"></div>
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-6 text-sm n3uralia-text-muted">
            <span>© 2025 n3uralia AI Enhancement Platform. All rights reserved.</span>
          </div>

          <div className="flex items-center space-x-6 text-sm">
            <button className="n3uralia-text-muted hover:text-white transition-colors">Privacy Policy</button>
            <button className="n3uralia-text-muted hover:text-white transition-colors">Terms of Service</button>
            <button className="n3uralia-text-muted hover:text-white transition-colors">ASEAN Guidelines</button>
          </div>
        </div>

        {/* Cultural Recognition */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Heart className="w-4 h-4 text-white/70" />
            <span className="text-sm text-white/70">Built with respect for ASEAN cultural diversity</span>
            <span className="text-lg">🇮🇩🇲🇾🇹🇭🇵🇭🇸🇬🇻🇳🇧🇳🇰🇭🇱🇦🇲🇲</span>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
