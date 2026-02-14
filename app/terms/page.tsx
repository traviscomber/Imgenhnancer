"use client"

import { useEffect } from "react"

export default function TermsPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
            <p className="text-gray-400">Last updated: February 14, 2026</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6">
            {/* Acceptance */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
              <p className="text-gray-300">
                By accessing and using clar1ty, you agree to be bound by these Terms of Service. If you do not agree, do not use the service. These terms are governed by Chilean law.
              </p>
            </section>

            {/* Service Description */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">2. Service Description</h2>
              <p className="text-gray-300">
                clar1ty provides image enhancement and restoration services. The service processes uploaded images and returns enhanced versions. We make no guarantees about output quality, and results may vary based on input image quality and content.
              </p>
            </section>

            {/* User Responsibilities */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">3. User Responsibilities</h2>
              <div className="space-y-3 text-gray-300">
                <p>You agree that you will:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Only upload images you own or have permission to use</li>
                  <li>Not use the service for illegal, harmful, or unethical purposes</li>
                  <li>Not attempt to reverse-engineer, hack, or abuse the service</li>
                  <li>Not upload images containing hate speech, violence, or illegal content</li>
                  <li>Not violate anyone's intellectual property or privacy rights</li>
                  <li>Download your enhanced images within 7 days of enhancement</li>
                </ul>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">4. Intellectual Property</h2>
              <div className="space-y-4 text-gray-300">
                <p>
                  <strong>Your Images:</strong> You retain all ownership and rights to images you upload. By using our service, you grant us a limited license to process your images for enhancement purposes only.
                </p>
                <p>
                  <strong>Our Service:</strong> All clar1ty software, algorithms, interface design, and documentation remain our intellectual property.
                </p>
                <p>
                  <strong>License Grant:</strong> We grant you a non-exclusive, non-transferable license to use the service for personal use. Commercial use requires a paid plan.
                </p>
              </div>
            </section>

            {/* Data Responsibility */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">5. 7-Day Data Retention & Download Requirement</h2>
              <div className="space-y-3 text-gray-300 bg-amber-500/10 border border-amber-500/30 p-4 rounded-lg">
                <p className="font-semibold text-amber-400">CRITICAL: Images are automatically deleted after 7 days</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Uploaded images are deleted after 7 days from upload</li>
                  <li>Enhanced images are deleted after 7 days from enhancement</li>
                  <li>You are responsible for downloading your enhanced images within this window</li>
                  <li>We are NOT liable for lost images after the 7-day retention period</li>
                  <li>Deleted images cannot be recovered</li>
                </ul>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">6. Limitation of Liability</h2>
              <div className="space-y-3 text-gray-300 bg-red-500/10 border border-red-500/30 p-4 rounded-lg">
                <p className="font-semibold text-red-400">DISCLAIMER OF WARRANTIES</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li>The service is provided "AS IS" without warranties of any kind</li>
                  <li>We do not guarantee specific output quality or results</li>
                  <li>We are not liable for lost, corrupted, or deleted images</li>
                  <li>We are not liable for service interruptions or downtime</li>
                  <li>We are not liable for damages resulting from your use of the service</li>
                  <li>We are not liable for third-party actions or copyright claims related to your images</li>
                </ul>
              </div>
            </section>

            {/* Indemnification */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">7. Indemnification</h2>
              <p className="text-gray-300">
                You agree to indemnify and hold harmless clar1ty, n3uralia group, and their officers from any claims, damages, or costs arising from: (a) your use of the service, (b) violation of these terms, (c) infringement of third-party rights related to your uploaded images, or (d) illegal content you upload.
              </p>
            </section>

            {/* Acceptable Use Policy */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">8. Acceptable Use Policy</h2>
              <p className="text-gray-300 mb-3">You may NOT use the service to:</p>
              <ul className="space-y-2 list-disc list-inside text-gray-300">
                <li>Generate deepfakes or manipulated content for deception</li>
                <li>Create non-consensual intimate imagery</li>
                <li>Violate anyone's privacy, likeness, or image rights</li>
                <li>Facilitate illegal activities</li>
                <li>Spam, phish, or distribute malware</li>
                <li>Reverse-engineer or copy our algorithms</li>
                <li>Interfere with service operation or security</li>
              </ul>
              <p className="text-gray-300 mt-4">
                Violation of these terms will result in immediate account suspension and potential legal action.
              </p>
            </section>

            {/* Content Moderation */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">9. Content Moderation & Removal</h2>
              <p className="text-gray-300">
                We reserve the right to refuse service, suspend accounts, or delete content that violates these terms, including but not limited to illegal content, hate speech, violence, or exploitative material.
              </p>
            </section>

            {/* Service Availability */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">10. Service Availability & Uptime</h2>
              <p className="text-gray-300">
                While we strive to maintain continuous service, we do not guarantee 100% uptime. We are not liable for service interruptions, scheduled maintenance, or force majeure events.
              </p>
            </section>

            {/* Pricing & Payment */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">11. Pricing & Payment</h2>
              <div className="space-y-3 text-gray-300">
                <p>
                  Pricing is displayed at time of purchase. By purchasing, you authorize payment via Stripe. Refunds are subject to our refund policy. Free credits expire after 30 days of inactivity.
                </p>
              </div>
            </section>

            {/* Dispute Resolution */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">12. Dispute Resolution</h2>
              <p className="text-gray-300">
                Any disputes arising from these terms shall be resolved according to Chilean law, and you consent to jurisdiction in Chilean courts.
              </p>
            </section>

            {/* Termination */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">13. Termination</h2>
              <p className="text-gray-300">
                We may terminate or suspend your account at any time for violation of these terms or illegal activity. Upon termination, all data will be deleted per our retention policy.
              </p>
            </section>

            {/* Contact */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">14. Contact & Support</h2>
              <p className="text-gray-300">
                For questions or disputes, contact: <a href="mailto:legal@clar1ty.art" className="text-amber-400 hover:text-amber-300">legal@clar1ty.art</a>
              </p>
            </section>

            {/* Changes to Terms */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">15. Changes to Terms</h2>
              <p className="text-gray-300">
                We may update these terms periodically. Continued use of the service constitutes acceptance of updated terms.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
