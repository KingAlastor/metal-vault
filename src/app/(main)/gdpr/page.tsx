export default async function Page() {
  return (
    <div className="gdpr-policy max-w-4xl mx-auto p-6 text-sm">
      <header className="gdpr-header mb-8">
        <h1 className="text-2xl font-bold mb-2">Privacy Policy</h1>
        <p className="effective-date text-gray-600">Effective Date: September 21, 2025</p>
      </header>

      <div className="gdpr-content space-y-6">
        <p className="intro text-gray-700 leading-relaxed">
          Your privacy is important to us. This policy explains how we collect, use, and handle your information when you use our website. We are committed to a policy of collecting only the data we need to provide our service to you.
        </p>

        <section className="gdpr-section">
          <h2 className="text-lg font-semibold mb-3">1. What Information We Collect</h2>
          <p className="mb-3 text-gray-700">
            We do not have our own password management system. Instead, we use third-party single sign-on (SSO) providers to manage your login and account creation. We collect and store the following personal information directly from these providers:
          </p>
          <ul className="list-disc list-inside mb-3 text-gray-700 space-y-1">
            <li><strong>Your Name:</strong> As provided by your chosen SSO provider.</li>
            <li><strong>Your Email Address:</strong> As provided by your chosen SSO provider.</li>
          </ul>
          <p className="text-gray-700">We do not collect or store any other personal information from your public profile on these third-party services.</p>
        </section>

        <section className="gdpr-section">
          <h2 className="text-lg font-semibold mb-3">2. How We Use Your Information</h2>
          <p className="mb-3 text-gray-700">We use the name and email address we collect for the sole purpose of creating and managing your user account on our website. This includes:</p>
          <ul className="list-disc list-inside mb-3 text-gray-700 space-y-1">
            <li>Creating your user profile.</li>
            <li>Maintaining your logged-in status.</li>
            <li>Communicating with you about your account.</li>
          </ul>
          <p className="text-gray-700">We do not use your name or email for marketing purposes unless you explicitly opt in to our newsletter.</p>
        </section>

        <section className="gdpr-section">
          <h2 className="text-lg font-semibold mb-3">3. Third-Party Services</h2>
          <p className="mb-3 text-gray-700">
            We rely on third-party SSO providers to handle your authentication. These providers have their own terms of service and privacy policies, and they are responsible for the data they collect and manage on their platforms.
          </p>
          <p className="mb-3 text-gray-700">When you use one of our SSO options, you are subject to the policies of that service. You can review their respective privacy policies here:</p>
          <ul className="list-disc list-inside mb-3 text-gray-700 space-y-1">
            <li>Google: [Link to Google's Privacy Policy]</li>
            <li>Meta: [Link to Meta's Privacy Policy]</li>
            <li>Discord: [Link to Discord's Privacy Policy]</li>
            <li>Other: Please check the provider's official policy for details.</li>
          </ul>
          <p className="text-gray-700">We are not responsible for the privacy practices of these third-party services.</p>
        </section>

        <section className="gdpr-section">
          <h2 className="text-lg font-semibold mb-3">4. Cookies</h2>
          <p className="mb-3 text-gray-700">
            We use a single, strictly necessary cookie to manage your login session. This cookie is essential for the basic function of our website and is not used for tracking, analytics, or advertising.
          </p>
          <p className="text-gray-700">
            This cookie is set only after you initiate the login process and is required to keep you logged in to your account. We do not use any cookies for marketing or advertising.
          </p>
        </section>

        <section className="gdpr-section">
          <h2 className="text-lg font-semibold mb-3">5. Your Rights</h2>
          <p className="mb-3 text-gray-700">Under GDPR, you have the right to access, correct, or request the deletion of your personal data. We provide a self-service option to help you exercise your rights:</p>
          <p className="mb-3 text-gray-700">
            <strong>Right to Erasure (Right to be Forgotten):</strong> You can permanently delete your user account and all associated data directly from your profile settings. This action is irreversible.
          </p>
          <p className="text-gray-700">If you have any issues exercising these rights, please contact us directly at the email provided below.</p>
        </section>

        <section className="gdpr-section">
          <h2 className="text-lg font-semibold mb-3">6. Contact Us</h2>
          <p className="mb-3 text-gray-700">If you have any questions about this privacy policy or your personal data, please contact us at:</p>
          <p className="contact-email">
            <a href="mailto:kingalastor@metal-vault.com" className="text-blue-600 hover:underline">kingalastor@metal-vault.com</a>
          </p>
        </section>
      </div>
    </div>
  );
}