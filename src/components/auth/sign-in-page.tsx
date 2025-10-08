"use client";
import { GoogleLogin } from "@/components/auth/google-login";

export default function CustomOAuthSignIn() {
  return (
    <div className="flex flex-col min-h-screen p-4">
      <div className="space-y-4">
        <div className=" border-gray-200 rounded-lg p-4 mb-4 max-w-md">
          <p className="text-sm text-gray-600">
            By clicking &quot;Sign in&quot; you agree to our{" "}
            <a href="/gdpr" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>{" "}
            and consent to the use of your email address and name to create your
            account and manage your session.
          </p>
        </div>
        <GoogleLogin />
      </div>
    </div>
  );
}
