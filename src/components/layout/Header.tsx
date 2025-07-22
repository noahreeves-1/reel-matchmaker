"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useState } from "react";
import Image from "next/image";

// HEADER COMPONENT: Main navigation and branding with authentication
// This component provides the top navigation bar with branding, links, and conditional auth
// Shows Sign In/Create Account when not authenticated, Sign Out when authenticated
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Dynamic content based on session, requires client-side rendering
// - VERCEL OPTIMIZATIONS: Client component with session-aware navigation
// - SCALE BREAKERS: Session checks on every render
// - FUTURE IMPROVEMENTS: Add user menu, notifications, dynamic navigation
//
// CURRENT USAGE: Main navigation, branding, page links, conditional authentication
// ARCHITECTURE: Client Component → Session-aware Navigation

export const Header = () => {
  const { data: session, status } = useSession();
  const isLoading = status === "loading";
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ redirectTo: "/" });
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity cursor-pointer"
          >
            <Image
              src="/reel-matchmaker-icon.png"
              alt="Reel Matchmaker"
              width={40}
              height={40}
            />
            <h1 className="ml-2 text-xl font-bold text-slate-900 dark:text-white">
              Reel Matchmaker
            </h1>
          </Link>

          <nav className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Discover
            </Link>
            <Link
              href="/genres"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Genres
            </Link>
            <Link
              href="/my-movies"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              My Movies
            </Link>

            {/* Authentication Links - Conditionally rendered based on session */}
            <div className="flex items-center space-x-4">
              {isLoading ? (
                // Show loading state while session is being fetched
                <div className="text-slate-600 dark:text-slate-300 px-3 py-2 text-sm">
                  Loading...
                </div>
              ) : session ? (
                // User is authenticated - show user menu dropdown
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {/* User Avatar Icon */}
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {session.user?.name?.[0]?.toUpperCase() ||
                          session.user?.email?.[0]?.toUpperCase() ||
                          "U"}
                      </span>
                    </div>
                    <span>{session.user?.name || session.user?.email}</span>
                    {/* Dropdown Arrow */}
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {/* User Menu Dropdown */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg py-1 z-50 border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // User is not authenticated - show sign in and register links
                <>
                  <Link
                    href="/login"
                    className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-3 py-2 rounded-md text-sm font-medium cursor-pointer"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
