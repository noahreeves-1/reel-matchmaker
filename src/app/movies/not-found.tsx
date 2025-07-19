import Link from "next/link";

export default function MoviesNotFound() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
          <li>
            <Link
              href="/"
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <span className="text-slate-400">/</span>
          </li>
          <li className="text-slate-900 dark:text-white font-medium">Movies</li>
        </ol>
      </nav>

      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎬</div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
          Movies Not Found
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
          Sorry, we couldn't find the movies you're looking for. The page might
          have been moved or doesn't exist.
        </p>
        <div className="space-x-4">
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
          >
            Go Home
          </Link>
          <Link
            href="/movies"
            className="inline-flex items-center px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Browse Movies
          </Link>
        </div>
      </div>
    </div>
  );
}
