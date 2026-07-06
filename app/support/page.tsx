'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail, MessageSquare, Phone, ArrowLeft } from 'lucide-react'

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/support/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 pt-20">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-amber-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              How Can We Help?
            </h1>
            <p className="text-xl text-gray-400">
              Get support, ask questions, or share your feedback with our team
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Contact Methods */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">Contact Methods</h2>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-amber-500/50 transition-colors">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Email Support</h3>
                    <p className="text-gray-400 text-sm mb-3">Get a response within 24 hours</p>
                    <a
                      href="mailto:info@clar1ty.art"
                      className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
                    >
                      info@clar1ty.art
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-amber-500/50 transition-colors">
                <div className="flex items-start gap-4">
                  <MessageSquare className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Direct Message</h3>
                    <p className="text-gray-400 text-sm mb-3">Use the form below to reach us</p>
                    <p className="text-sm text-amber-400">Scroll down to the contact form</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-amber-500/50 transition-colors">
                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-white mb-1">Response Time</h3>
                    <p className="text-gray-400 text-sm">We aim to respond to all inquiries within 24-48 business hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick FAQ */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-white mb-6">Quick Help</h2>
              <div className="space-y-3">
                <Link href="/faq" className="block bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-amber-500/50 transition-colors">
                  <h3 className="font-semibold text-white mb-1">FAQ</h3>
                  <p className="text-gray-400 text-sm">Find answers to common questions</p>
                </Link>
                <Link href="/privacy" className="block bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-amber-500/50 transition-colors">
                  <h3 className="font-semibold text-white mb-1">Privacy Policy</h3>
                  <p className="text-gray-400 text-sm">Learn how we protect your data</p>
                </Link>
                <Link href="/terms" className="block bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-amber-500/50 transition-colors">
                  <h3 className="font-semibold text-white mb-1">Terms & Conditions</h3>
                  <p className="text-gray-400 text-sm">Review our terms of service</p>
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>

            {submitStatus === 'success' && (
              <div className="mb-6 p-4 bg-green-900/20 border border-green-800 rounded-lg">
                <p className="text-green-400">Thank you! Your message has been sent successfully. We'll get back to you soon.</p>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-red-400">There was an error sending your message. Please try again or email us directly.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="">Select a subject...</option>
                  <option value="technical">Technical Support</option>
                  <option value="billing">Billing & Credits</option>
                  <option value="feature">Feature Request</option>
                  <option value="feedback">General Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  placeholder="Tell us how we can help..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-semibold py-3 rounded-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
