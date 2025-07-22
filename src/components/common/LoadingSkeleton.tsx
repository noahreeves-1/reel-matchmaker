// Loading skeleton component for placeholder UI during data loading
// Provides animated placeholder content while data is being fetched

interface LoadingSkeletonProps {
  itemCount?: number;
  className?: string;
}

export const LoadingSkeleton = ({
  itemCount = 8,
  className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
}: LoadingSkeletonProps) => (
  <div className="animate-pulse">
    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-48 mb-8"></div>
    <div className={className}>
      {[...Array(itemCount)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
        >
          <div className="h-48 bg-slate-200 dark:bg-slate-700"></div>
          <div className="p-4">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
          </div>
        </div>
      ))}
    </div>
  </div>
);
