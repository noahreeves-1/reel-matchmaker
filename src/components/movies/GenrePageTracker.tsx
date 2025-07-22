"use client";

import { useEffect } from "react";

interface GenrePageTrackerProps {
  genreId: number;
  genreName: string;
}

/**
 * Client component to track genre page information for breadcrumb navigation
 * Stores genre name in sessionStorage so movie detail pages can show correct breadcrumbs
 */
export const GenrePageTracker = ({
  genreId,
  genreName,
}: GenrePageTrackerProps) => {
  useEffect(() => {
    // Store the current page path and genre information in sessionStorage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("previousPage", window.location.pathname);
      sessionStorage.setItem(`genre-${genreId}-name`, genreName);
    }
  }, [genreId, genreName]);

  // This component doesn't render anything
  return null;
};
