"use client";

import { useEffect } from "react";

/**
 * Client component to track genres page for breadcrumb navigation
 * Stores the current page path in sessionStorage so movie detail pages can show correct breadcrumbs
 */
export const GenresPageTracker = () => {
  useEffect(() => {
    // Store the current page path in sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("previousPage", window.location.pathname);
    }
  }, []);

  // This component doesn't render anything
  return null;
};
