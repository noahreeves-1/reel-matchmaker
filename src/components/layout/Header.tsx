import Link from "next/link";

// HEADER COMPONENT: Main navigation and branding
// This component provides the top navigation bar with branding and links
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Static navigation, no user-specific content, limited personalization
// - VERCEL OPTIMIZATIONS: Static component, CDN caching, instant loading
// - SCALE BREAKERS: None - this is a simple static component
// - FUTURE IMPROVEMENTS: Add user menu, notifications, dynamic navigation
//
// CURRENT USAGE: Main navigation, branding, page links
// ARCHITECTURE: Static Component → No Server Load

export const Header = () => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">RM</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Reel Matchmaker
            </h1>
          </Link>

          <nav className="flex space-x-8">
            <Link
              href="/"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Discover
            </Link>
            <Link
              href="/my-movies"
              className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              My Movies
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
};
