"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// RENDERING STRATEGY: Client Component for Interactive Form
// - This component handles all client-side interactions (form submission, validation, navigation)
// - Used within an SSG page for optimal performance and SEO
// - Benefits: Interactive forms, real-time validation, immediate user feedback
// - Perfect for: Form handling within static pages
//
// AUTHENTICATION FLOW:
// - FORM SUBMISSION: Client-side form handling with FormData API
// - NEXTAUTH SIGNIN: Secure authentication via NextAuth.js credentials provider
// - ERROR HANDLING: Real-time error display with loading states
// - REDIRECTION: Programmatic navigation with router.push and router.refresh
// - GUEST ACCESS: Alternative navigation path for non-authenticated users

export function LoginForm() {
  // Client-side state management for form handling and user feedback
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Next.js router for programmatic navigation
  const router = useRouter();

  // Client-side form submission handler with NextAuth.js integration
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Extract form data using native FormData API
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      // NextAuth.js client-side authentication
      // redirect: false prevents automatic redirect, allowing custom handling
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Handle redirect manually for better UX
      });

      if (result?.error) {
        setError("Invalid credentials.");
      } else {
        // Successful login - programmatic navigation with refresh
        // router.refresh() ensures fresh data after authentication
        router.push("/");
        router.refresh();
      }
    } catch {
      setError("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header with Next.js Link for optimized navigation */}
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
              🎬 Reel Matchmaker
            </h1>
          </Link>
          <p className="text-slate-600 dark:text-slate-400">
            Sign in to rate movies and get personalized recommendations
          </p>
        </div>

        {/* Login Card with client-side form handling */}
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <div className="space-y-6">
            {/* Real-time error display with controlled state */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Client-side form with controlled submission */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your password"
                  minLength={6}
                />
              </div>

              {/* Loading state with disabled button during authentication */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Or continue as guest
                </span>
              </div>
            </div>

            {/* Guest access with Next.js Link for client-side navigation */}
            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Continue as Guest
              </Link>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  Don't have an account?
                </span>
              </div>
            </div>

            {/* Registration link with Next.js Link for optimized navigation */}
            <div className="text-center space-y-2">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Create one to start rating movies and getting personalized
                recommendations
              </p>
              <Link
                href="/register"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>

        {/* Footer with external links (placeholder pages) */}
        <div className="text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            By signing in, you agree to our{" "}
            <Link
              href="/terms"
              className="underline hover:text-slate-700 dark:hover:text-slate-300"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline hover:text-slate-700 dark:hover:text-slate-300"
            >
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
