"use client";

import { useEffect, useState } from "react";
import { MovieDetails } from "./MovieDetails";
import { TMDBMovie } from "@/lib/tmdb";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface MovieDetailsWithBreadcrumbsProps {
  movie: TMDBMovie;
}

export const MovieDetailsWithBreadcrumbs = ({
  movie,
}: MovieDetailsWithBreadcrumbsProps) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);

  useEffect(() => {
    // Try multiple methods to determine the previous page
    const referrer = document.referrer;
    const previousPage = sessionStorage.getItem("previousPage");

    console.log("Document referrer:", referrer);
    console.log("SessionStorage previousPage:", previousPage);

    // Parse the referrer URL to determine the source
    const breadcrumbItems: BreadcrumbItem[] = [{ label: "Home", href: "/" }];

    // Use sessionStorage as primary source, fallback to referrer
    let sourcePath = previousPage;

    if (!sourcePath && referrer) {
      try {
        const referrerUrl = new URL(referrer);
        sourcePath = referrerUrl.pathname;
      } catch (error) {
        console.error("Error parsing referrer:", error);
      }
    }

    console.log("Source path:", sourcePath);

    if (sourcePath) {
      if (sourcePath === "/my-movies") {
        breadcrumbItems.push({ label: "My Movies", href: "/my-movies" });
      } else if (sourcePath === "/movies") {
        breadcrumbItems.push({ label: "Popular Movies", href: "/movies" });
      } else if (sourcePath === "/") {
        // If coming from home, don't add any intermediate breadcrumb
        // The home page shows "Popular Movies" but it's not a separate section
      } else if (sourcePath.startsWith("/movies/")) {
        // If coming from another movie page, add Popular Movies breadcrumb
        breadcrumbItems.push({ label: "Popular Movies", href: "/movies" });
      } else {
        // For any other path, default to Popular Movies
        breadcrumbItems.push({ label: "Popular Movies", href: "/movies" });
      }
    } else {
      console.log("No source path found");
      // If no source path (direct navigation), use default
      breadcrumbItems.push({ label: "Popular Movies", href: "/movies" });
    }

    // Add the current movie title (no href since it's the current page)
    breadcrumbItems.push({ label: movie.title });

    console.log("Final breadcrumbs:", breadcrumbItems);
    setBreadcrumbs(breadcrumbItems);
  }, [movie.title]);

  return <MovieDetails movie={movie} breadcrumbs={breadcrumbs} />;
};
