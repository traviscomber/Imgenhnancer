import {
  Brain,
  Mail,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Shield,
  Zap,
  Eye,
  Cpu,
  Award,
  Users,
  ArrowRight,
  CheckCircle,
} from "lucide-react"

const Footer = () => {
  return (
    <footer className="n3uralia-gradient border-t n3uralia-border mt-20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-12 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center n3uralia-glow-gold">
                <Brain className="w-6 h-6 n3uralia-gold-accent" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white n3uralia-gold-accent">n3uralia</h3>
                <p className="text-sm n3uralia-text-muted">AI Image Enhancement</p>
              </div>
            </div>
            <p className="n3uralia-text-muted leading-relaxed mb-6">
              Professional AI image enhancement platform with cultural sensitivity. Preserving authenticity while
              delivering exceptional quality for Southeast Asian communities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-white/60 hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Platform Capabilities */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Platform Capabilities</h4>
            <ul className="space-y-4">
              {[
                { icon: Shield, text: "Face Preservation Technology", desc: "100% authentic feature protection" },
                { icon: Zap, text: "AI-Powered Enhancement", desc: "4x upscaling with neural networks" },
                { icon: Eye, text: "Cultural Sensitivity", desc: "ASEAN-focused algorithms" },
                { icon: Cpu, text: "Advanced Processing", desc: "Multi-stage enhancement pipeline" },
              ].map((item, index) => (
                <li key={index} className="flex items-start space-x-3 group">
                  <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center mt-0.5 group-hover:n3uralia-glow-gold transition-all">
                    <item.icon className="w-4 h-4 n3uralia-gold-accent" />
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{item.text}</p>
                    <p className="n3uralia-text-muted text-xs">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Use Cases */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Professional Applications</h4>
            <ul className="space-y-3">
              {[
                "Wedding Photography",
                "Family Portraits",
                "Official Documents",
                "Cultural Heritage",
                "Social Media Content",
                "Commercial Projects",
              ].map((item, index) => (
                <li key={index} className="flex items-center space-x-3 group cursor-pointer">
                  <div className="w-1.5 h-1.5 rounded-full bg-gold-500 group-hover:bg-gold-400 transition-colors"></div>
                  <span className="text-white/70 group-hover:text-white transition-colors text-sm">{item}</span>
                  <ArrowRight className="w-3 h-3 text-white/30 group-hover:text-gold-500 group-hover:translate-x-1 transition-all" />
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Stay Connected</h4>

            {/* Contact Info */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 n3uralia-gold-accent" />
                <span className="text-white/70 text-sm">hello@n3uralia.ai</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="w-4 h-4 n3uralia-gold-accent" />
                <span className="text-white/70 text-sm">Southeast Asia</span>
              </div>
            </div>

            {/* Newsletter Signup */}
            <div className="n3uralia-card rounded-lg p-4 border n3uralia-border-gold">
              <h5 className="text-white font-medium mb-3 text-sm">Newsletter</h5>
              <p className="text-xs n3uralia-text-muted mb-4">Get updates on new features and AI advancements</p>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter email"
                  className="flex-1 n3uralia-input text-xs px-3 py-2 rounded-md"
                />
                <button className="n3uralia-button-gold px-3 py-2 rounded-md text-xs font-medium">Subscribe</button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="n3uralia-card rounded-2xl p-8 mb-12 border n3uralia-border-gold">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, number: "10K+", label: "Active Users", desc: "Trusted by professionals" },
              { icon: Award, number: "500K+", label: "Images Enhanced", desc: "With face preservation" },
              { icon: Shield, number: "99.9%", label: "Accuracy Rate", desc: "In feature preservation" },
              { icon: Globe, number: "6", label: "ASEAN Countries", desc: "Specialized support" },
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:n3uralia-glow-gold transition-all">
                  <stat.icon className="w-6 h-6 n3uralia-gold-accent" />
                </div>
                <div className="text-2xl font-bold text-white mb-2 n3uralia-gold-accent">{stat.number}</div>
                <div className="text-white font-medium mb-1">{stat.label}</div>
                <div className="text-xs n3uralia-text-muted">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ASEAN Focus Banner */}
        <div className="n3uralia-card-premium rounded-2xl p-8 mb-12 text-center border n3uralia-border-gold">
          <div className="text-4xl mb-4">🇮🇩🇲🇾🇹🇭🇵🇭🇸🇬🇻🇳</div>
          <h4 className="text-xl font-bold text-white mb-3">Built for Southeast Asia</h4>
          <p className="n3uralia-text-muted max-w-2xl mx-auto mb-6">
            The first AI enhancement platform specifically designed to respect and preserve the unique facial
            characteristics and cultural heritage of ASEAN communities.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {["🛡️ Face Preservation", "🎨 Cultural Respect", "⚡ Advanced AI", "🌏 Regional Focus"].map(
              (feature, index) => (
                <div key={index} className="bg-white/5 px-4 py-2 rounded-full border n3uralia-border-gold">
                  <span className="text-sm text-white">{feature}</span>
                </div>
              ),
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t n3uralia-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-6 text-sm n3uralia-text-muted">
              <span>© 2025 n3uralia. All rights reserved.</span>
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                ASEAN Guidelines
              </a>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 n3uralia-gold-accent" />
                <span className="text-sm text-white">Face Preservation Certified</span>
              </div>
              <div className="w-px h-4 bg-white/20"></div>
              <div className="flex items-center space-x-2">
                <div
                  className="w-2 h-2 rounded-full n3uralia-pulse-gold"
                  style={{ backgroundColor: "rgba(218, 165, 32, 1)" }}
                ></div>
                <span className="text-sm text-white">AI Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
