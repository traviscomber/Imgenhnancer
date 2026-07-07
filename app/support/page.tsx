'use client'

import type React from 'react'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowLeft, Clock, HelpCircle, Mail, MessageSquare, Shield } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClarityLogo } from '@/components/clarity-logo'

const quickLinks = [
  {
    href: '/faq',
    title: 'FAQ',
    copy: 'Answers about credits, privacy, image types, and enhancement results.',
  },
  {
    href: '/pricing',
    title: 'Pricing',
    copy: 'Understand credit packages and enhancement costs before uploading.',
  },
  {
    href: '/privacy',
    title: 'Privacy',
    copy: 'Review how Clar1ty handles image processing and storage.',
  },
]

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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
    <main className="min-h-screen bg-black px-6 py-10 text-[#efe8dc]">
      <div className="pointer-events-none fixed inset-0 opacity-25">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_28%_18%,rgba(201,149,61,0.22),transparent_34%),radial-gradient(circle_at_74%_8%,rgba(122,91,50,0.18),transparent_34%)]" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <nav className="flex items-center justify-between border-b border-white/10 pb-8">
          <Link href="/" aria-label="clar1ty home">
            <ClarityLogo className="h-10 w-auto drop-shadow-[0_0_10px_rgba(211,155,62,0.45)]" width={145} height={44} />
          </Link>
          <div className="flex items-center gap-5 text-sm text-[#d8d0c4]">
            <Link href="/pricing" className="hidden hover:text-[#d7a957] sm:inline">
              Pricing
            </Link>
            <Link href="/enhance" className="rounded-full border border-[#c9953d]/40 px-4 py-2 text-[#f0d59c] hover:border-[#c9953d] hover:text-white">
              Login
            </Link>
          </div>
        </nav>

        <Link href="/" className="mt-10 inline-flex items-center gap-2 text-sm text-[#b9ad9a] transition hover:text-[#d7a957]">
          <ArrowLeft className="h-4 w-4" />
          Back to landing
        </Link>

        <section className="grid gap-12 py-16 lg:grid-cols-[0.44fr_0.56fr] lg:py-24">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#c9953d]">Clar1ty support</p>
            <h1 className="mt-6 text-5xl font-light leading-tight tracking-[0.02em] text-white md:text-6xl">
              We help keep your images moving.
            </h1>
            <p className="mt-8 max-w-xl text-sm leading-7 text-[#d8d0c4]">
              Ask about credits, image preparation, privacy, restoration expectations, or production use. We keep support
              simple, private, and close to the product workflow.
            </p>

            <div className="mt-12 grid gap-4">
              <SupportFact Icon={Mail} title="Email support" copy="info@clar1ty.art" />
              <SupportFact Icon={Clock} title="Response window" copy="Usually within 24-48 business hours." />
              <SupportFact Icon={Shield} title="Private by default" copy="Do not send sensitive images unless our team specifically asks for them." />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="rounded-2xl border border-[#6f5d49] bg-[#0d0b09]/90 p-7 shadow-[0_0_45px_rgba(214,188,117,0.12)] md:p-10">
            <div className="mb-8 flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#c9953d]/40 bg-[#21170f] text-[#d7a957]">
                <MessageSquare className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-light text-white">Send a message</h2>
                <p className="mt-1 text-sm text-[#b9ad9a]">We will route it to the right person.</p>
              </div>
            </div>

            {submitStatus === 'success' ? (
              <div className="mb-6 border border-[#6fa26c]/50 bg-[#193119]/35 p-4 text-sm text-[#bde2ba]">
                Your message was received. We will get back to you soon.
              </div>
            ) : null}

            {submitStatus === 'error' ? (
              <div className="mb-6 border border-[#a66a50]/50 bg-[#32170f]/50 p-4 text-sm text-[#f0b7a3]">
                The form could not submit. Please try again or email info@clar1ty.art.
              </div>
            ) : null}

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Name">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="clarity-input"
                  placeholder="Your name"
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="clarity-input"
                  placeholder="your@email.com"
                />
              </Field>
            </div>

            <Field label="Subject" className="mt-5">
              <select name="subject" value={formData.subject} onChange={handleChange} required className="clarity-input">
                <option value="">Select a subject...</option>
                <option value="technical">Technical support</option>
                <option value="billing">Billing and credits</option>
                <option value="feature">Feature request</option>
                <option value="feedback">General feedback</option>
                <option value="other">Other</option>
              </select>
            </Field>

            <Field label="Message" className="mt-5">
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                className="clarity-input resize-none"
                placeholder="Tell us how we can help..."
              />
            </Field>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="mt-7 h-12 w-full rounded-none bg-[#c9953d] text-sm font-semibold text-black hover:bg-[#e0b365] disabled:opacity-60"
            >
              {isSubmitting ? 'Sending...' : 'Send message'}
            </Button>
          </form>
        </section>

        <section className="grid gap-5 pb-20 md:grid-cols-3">
          {quickLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-white/10 bg-white/[0.035] p-7 transition hover:border-[#c9953d]/60 hover:bg-[#160f09]"
            >
              <HelpCircle className="h-6 w-6 text-[#c9953d]" />
              <h3 className="mt-8 text-lg font-semibold text-white group-hover:text-[#f0d59c]">{item.title}</h3>
              <p className="mt-4 text-sm leading-6 text-[#b9ad9a]">{item.copy}</p>
            </Link>
          ))}
        </section>
      </div>
    </main>
  )
}

function SupportFact({ Icon, title, copy }: { Icon: LucideIcon; title: string; copy: string }) {
  return (
    <div className="flex gap-5 border border-white/10 bg-white/[0.035] p-5">
      <Icon className="mt-1 h-6 w-6 shrink-0 text-[#c9953d]" />
      <div>
        <p className="font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#d8d0c4]">{copy}</p>
      </div>
    </div>
  )
}

function Field({ label, className = '', children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-[#d8d0c4]">{label}</span>
      {children}
    </label>
  )
}
