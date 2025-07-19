import { LoadingSkeleton } from "@/components/common";

export default function MoviesLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb skeleton */}
      <div className="mb-6">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
        </div>
      </div>

      {/* Title skeleton */}
      <div className="mb-8">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
        <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      </div>

      <LoadingSkeleton />
    </div>
  );
}
