import { LoadingSkeleton, PageContainer } from "@/components/common";

/**
 * Skeleton component for breadcrumb navigation
 */
const BreadcrumbSkeleton = () => (
  <div className="mb-6">
    <div className="flex items-center space-x-2">
      <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      <div className="h-4 w-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
    </div>
  </div>
);

/**
 * Skeleton component for page header
 */
const PageHeaderSkeleton = () => (
  <div className="mb-8">
    <div className="h-10 w-64 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2"></div>
    <div className="h-4 w-96 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
  </div>
);

/**
 * Movies loading page component
 * Shows skeleton UI while movies page is loading
 */
export default function MoviesLoading() {
  return (
    <PageContainer>
      <BreadcrumbSkeleton />
      <PageHeaderSkeleton />
      <LoadingSkeleton />
    </PageContainer>
  );
}
