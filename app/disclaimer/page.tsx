"use client"

import { useEffect } from "react"

export default function DisclaimerPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Legal Disclaimer</h1>
            <p className="text-gray-400">Last updated: February 14, 2026</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6">
            {/* No Warranty */}
            <section className="space-y-3 bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
              <h2 className="text-2xl font-bold text-red-400">1. NO WARRANTY</h2>
              <p className="text-gray-300">
                clar1ty is provided on an "AS IS" and "AS AVAILABLE" basis. We make NO representations or warranties of any kind, express or implied, regarding:
              </p>
              <ul className="space-y-2 list-disc list-inside text-gray-300">
                <li>Accuracy, quality, or fitness for any purpose</li>
                <li>Non-infringement of third-party rights</li>
                <li>Merchantability or title</li>
                <li>Specific output results or enhancements</li>
                <li>Uninterrupted service availability</li>
                <li>Freedom from errors or bugs</li>
              </ul>
            </section>

            {/* Limitation of Liability */}
            <section className="space-y-3 bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
              <h2 className="text-2xl font-bold text-red-400">2. LIMITATION OF LIABILITY</h2>
              <div className="space-y-3 text-gray-300">
                <p>
                  TO THE MAXIMUM EXTENT PERMITTED BY CHILEAN LAW, IN NO EVENT SHALL CLAR1TY, N3URALIA GROUP, OR THEIR OFFICERS BE LIABLE FOR:
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Lost or corrupted images (whether before, during, or after enhancement)</li>
                  <li>Data loss, unauthorized access, or privacy breaches beyond our reasonable control</li>
                  <li>Service interruptions, downtime, or technical failures</li>
                  <li>Any indirect, incidental, special, or consequential damages</li>
                  <li>Lost profits, revenue, or business opportunities</li>
                  <li>Emotional distress or reputational harm</li>
                  <li>Third-party claims related to your uploaded images</li>
                </ul>
                <p className="mt-4 font-semibold">
                  TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID TO CLAR1TY IN THE PAST 12 MONTHS, OR $100 USD IF NO PAYMENT WAS MADE.
                </p>
              </div>
            </section>

            {/* Data Loss Responsibility */}
            <section className="space-y-3 bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg">
              <h2 className="text-2xl font-bold text-amber-400">3. DATA LOSS & IMAGE RETENTION</h2>
              <div className="space-y-3 text-gray-300">
                <p className="font-semibold">
                  YOU ARE SOLELY RESPONSIBLE FOR BACKING UP YOUR IMAGES WITHIN 7 DAYS OF ENHANCEMENT.
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Images are automatically deleted after 7 days—this is not a bug, it is by design</li>
                  <li>We are not responsible for any loss of images after the 7-day retention period</li>
                  <li>We do not provide manual recovery of deleted images</li>
                  <li>Deletion is permanent and irreversible</li>
                  <li>We recommend downloading enhanced images immediately after enhancement</li>
                </ul>
              </div>
            </section>

            {/* Third-Party Services */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">4. Third-Party Services</h2>
              <p className="text-gray-300">
                clar1ty uses third-party services including Replicate, Stripe, Vercel, and Cloudflare. We are not responsible for:
              </p>
              <ul className="space-y-2 list-disc list-inside text-gray-300">
                <li>Service availability or uptime of third-party providers</li>
                <li>Data handling practices of third parties</li>
                <li>Outages, breaches, or failures caused by third parties</li>
              </ul>
              <p className="text-gray-300 mt-4">
                Refer to third-party privacy policies for how they handle your data.
              </p>
            </section>

            {/* Copyright & Image Rights */}
            <section className="space-y-3 bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg">
              <h2 className="text-2xl font-bold text-amber-400">5. Copyright & Image Rights</h2>
              <div className="space-y-3 text-gray-300">
                <p className="font-semibold">
                  YOU ARE SOLELY RESPONSIBLE FOR ENSURING YOU HAVE RIGHTS TO ALL IMAGES YOU UPLOAD.
                </p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>You represent that you own or have permission to use all images</li>
                  <li>clar1ty is not liable for copyright infringement claims</li>
                  <li>You will indemnify clar1ty for any third-party claims related to your images</li>
                  <li>Do not upload images that infringe on others' rights, privacy, or likeness</li>
                </ul>
              </div>
            </section>

            {/* AI Enhancement Accuracy */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">6. Enhancement Results Accuracy</h2>
              <p className="text-gray-300">
                The results of image enhancement may vary based on:
              </p>
              <ul className="space-y-2 list-disc list-inside text-gray-300">
                <li>Original image quality, resolution, and content</li>
                <li>Algorithm limitations and training data</li>
                <li>Processing parameters and settings</li>
              </ul>
              <p className="text-gray-300 mt-4">
                We do not guarantee specific outcomes or quality levels. Some results may be inappropriate for certain uses. You are responsible for reviewing and approving enhanced images before use.
              </p>
            </section>

            {/* Deepfake & Misuse */}
            <section className="space-y-3 bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
              <h2 className="text-2xl font-bold text-red-400">7. Prohibited Uses & Deepfakes</h2>
              <p className="text-gray-300">
                clar1ty is NOT intended for creating deepfakes, non-consensual intimate imagery, or misleading content. Misuse for these purposes:
              </p>
              <ul className="space-y-2 list-disc list-inside text-gray-300">
                <li>Violates these terms and may violate Chilean law</li>
                <li>Will result in immediate account termination</li>
                <li>May result in legal prosecution</li>
                <li>Makes YOU liable for damages and criminal penalties</li>
              </ul>
            </section>

            {/* Privacy & GDPR */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">8. Privacy & Data Protection</h2>
              <p className="text-gray-300">
                This service complies with Chilean Law 19.628. See our Privacy Policy for detailed information on data handling, retention, and your rights.
              </p>
            </section>

            {/* No Professional Advice */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">9. No Professional Advice</h2>
              <p className="text-gray-300">
                clar1ty is provided for personal use. We are not providing legal, financial, medical, or professional advice. Consult appropriate professionals for your specific needs.
              </p>
            </section>

            {/* International Use */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">10. International Use Compliance</h2>
              <p className="text-gray-300">
                If using this service from outside Chile, you are responsible for complying with local laws. Some countries may have additional restrictions on image processing or AI use.
              </p>
            </section>

            {/* Severability */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">11. Severability</h2>
              <p className="text-gray-300">
                If any part of this disclaimer is found invalid or unenforceable, the remaining provisions shall remain in full effect.
              </p>
            </section>

            {/* Contact for Legal Issues */}
            <section className="space-y-3 bg-gray-800 p-4 rounded-lg">
              <h2 className="text-2xl font-bold text-white">12. Legal Contact</h2>
              <p className="text-gray-300">
                For legal questions or concerns:
              </p>
              <div className="mt-3 text-gray-300">
                <p><strong>Email:</strong> <a href="mailto:legal@clar1ty.art" className="text-amber-400 hover:text-amber-300">legal@clar1ty.art</a></p>
                <p><strong>Service:</strong> clar1ty</p>
                <p><strong>Jurisdiction:</strong> Chile</p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="space-y-3 bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
              <h2 className="text-2xl font-bold text-blue-400">ACKNOWLEDGMENT</h2>
              <p className="text-gray-300">
                <strong>By using clar1ty, you acknowledge that you have read, understood, and agree to all terms of this disclaimer and our Terms of Service & Privacy Policy.</strong>
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
