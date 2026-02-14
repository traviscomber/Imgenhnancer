export const metadata = {
  title: "Privacy Policy - clar1ty",
  description: "Privacy Policy for clar1ty image enhancement service",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Privacy Policy</h1>
            <p className="text-gray-400">Last updated: February 14, 2026</p>
          </div>

          <div className="prose prose-invert max-w-none space-y-6">
            {/* Introduction */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">1. Introduction</h2>
              <p className="text-gray-300">
                clar1ty ("Service") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your personal data when using our image enhancement service. This policy complies with Chilean Law 19.628 on Personal Data Protection and international standards.
              </p>
            </section>

            {/* Data Collection */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">2. Data We Collect</h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="font-semibold text-amber-400 mb-2">2.1 Images You Upload</h3>
                  <p>
                    When you use our service, you upload images for enhancement. These images are processed and stored temporarily on our servers for the purpose of enhancement and quality assurance.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-400 mb-2">2.2 Account Information</h3>
                  <p>
                    If you create an account, we collect: email address, username, password (encrypted), account preferences, and usage history.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-400 mb-2">2.3 Technical Data</h3>
                  <p>
                    IP address, browser type, device information, pages visited, time spent, referring website, and enhancement parameters used.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-400 mb-2">2.4 Payment Information</h3>
                  <p>
                    Payment processing is handled by Stripe. We do not store full credit card details. See Stripe's privacy policy for payment data handling.
                  </p>
                </div>
              </div>
            </section>

            {/* Data Retention */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">3. Data Retention & Deletion</h2>
              <div className="space-y-4 text-gray-300">
                <div>
                  <h3 className="font-semibold text-amber-400 mb-2">3.1 Image Storage (7-Day Retention)</h3>
                  <p>
                    <strong>Uploaded images and enhanced images are automatically deleted after 7 days</strong> from upload/enhancement date. You must download your enhanced images within this 7-day window. After deletion, we cannot recover these files.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-400 mb-2">3.2 Account Data</h3>
                  <p>
                    Account information is retained for as long as your account is active. If you delete your account, personal data is removed within 30 days, except where legally required to maintain records.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-amber-400 mb-2">3.3 Analytics & Logs</h3>
                  <p>
                    Technical logs and analytics data are retained for 12 months for service improvement and security purposes.
                  </p>
                </div>
              </div>
            </section>

            {/* Use of Data */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">4. How We Use Your Data</h2>
              <ul className="space-y-2 text-gray-300 list-disc list-inside">
                <li>Process and enhance your images</li>
                <li>Provide customer support</li>
                <li>Send service-related notifications</li>
                <li>Improve our algorithms and service quality</li>
                <li>Detect and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
              <p className="text-gray-300 mt-4">
                <strong>We do NOT:</strong> Use your images for training AI models, sell your data, share your images with third parties, or use your data for marketing without consent.
              </p>
            </section>

            {/* Data Sharing */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">5. Data Sharing & Third Parties</h2>
              <div className="space-y-4 text-gray-300">
                <p>We may share data with:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Replicate</strong> - For image processing (as contractually required)</li>
                  <li><strong>Stripe</strong> - For payment processing</li>
                  <li><strong>Vercel</strong> - For hosting and analytics</li>
                  <li><strong>Legal authorities</strong> - When required by law</li>
                </ul>
                <p className="mt-4">
                  All third parties are bound by confidentiality agreements and process data only as instructed.
                </p>
              </div>
            </section>

            {/* User Rights */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">6. Your Rights (Chilean Law 19.628)</h2>
              <div className="space-y-3 text-gray-300">
                <p>You have the right to:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Access:</strong> Request what personal data we hold</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate data</li>
                  <li><strong>Deletion:</strong> Request removal of your data (where applicable)</li>
                  <li><strong>Opposition:</strong> Object to processing of your data</li>
                  <li><strong>Withdraw Consent:</strong> Revoke consent at any time</li>
                </ul>
                <p className="mt-4">
                  To exercise these rights, contact: <a href="mailto:privacy@clar1ty.art" className="text-amber-400 hover:text-amber-300">privacy@clar1ty.art</a>
                </p>
              </div>
            </section>

            {/* Security */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">7. Data Security</h2>
              <p className="text-gray-300">
                We implement industry-standard security measures including encryption (TLS/SSL), secure data centers, regular security audits, and access controls. However, no system is 100% secure. We are not liable for unauthorized access beyond our reasonable control.
              </p>
            </section>

            {/* Cookies */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">8. Cookies & Tracking</h2>
              <p className="text-gray-300">
                We use cookies for authentication, preferences, and analytics. You can disable cookies in your browser settings, though some functionality may be limited.
              </p>
            </section>

            {/* Contact */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">9. Contact Information</h2>
              <p className="text-gray-300">
                For privacy inquiries, contact:
              </p>
              <div className="bg-gray-800 p-4 rounded-lg mt-2 text-gray-300">
                <p><strong>Email:</strong> privacy@clar1ty.art</p>
                <p><strong>Service:</strong> clar1ty</p>
                <p><strong>Jurisdiction:</strong> Chile</p>
              </div>
            </section>

            {/* Changes */}
            <section className="space-y-3">
              <h2 className="text-2xl font-bold text-white">10. Policy Changes</h2>
              <p className="text-gray-300">
                We may update this policy periodically. Continued use of the service after changes constitutes acceptance of the updated policy.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
