import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-slate-900 dark:text-white mb-4">
          404
        </h1>
        <h2 className="text-2xl font-semibold text-slate-700 dark:text-slate-300 mb-4">
          Page Not Found
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          href="/"
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
