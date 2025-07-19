"use client";

import { useEffect } from "react";
import { ErrorDisplay } from "@/components/common";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <ErrorDisplay
          error={error.message || "Something went wrong!"}
          onRetry={reset}
        />
      </div>
    </div>
  );
}
