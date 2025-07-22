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
      } else if (sourcePath === "/genres") {
        // If coming from the genres page, add Genres breadcrumb
        breadcrumbItems.push({ label: "Genres", href: "/genres" });
      } else if (sourcePath.startsWith("/genres/")) {
        // If coming from a specific genre page, we need to get the genre name
        // For now, we'll use a generic "Genre Movies" label
        // In the future, we could pass the genre name as a prop or get it from the URL
        const genreId = sourcePath.split("/")[2];
        if (genreId && !isNaN(Number(genreId))) {
          // Try to get genre name from sessionStorage if it was stored
          const genreName = sessionStorage.getItem(`genre-${genreId}-name`);
          if (genreName) {
            breadcrumbItems.push({ label: "Genres", href: "/genres" });
            breadcrumbItems.push({ label: genreName, href: sourcePath });
          } else {
            breadcrumbItems.push({ label: "Genres", href: "/genres" });
            breadcrumbItems.push({ label: "Genre Movies", href: sourcePath });
          }
        } else {
          breadcrumbItems.push({ label: "Genres", href: "/genres" });
        }
      } else {
        // For any other path, default to Popular Movies
        breadcrumbItems.push({ label: "Popular Movies", href: "/movies" });
      }
    } else {
      // If no source path (direct navigation), use default
      breadcrumbItems.push({ label: "Popular Movies", href: "/movies" });
    }

    // Add the current movie title (no href since it's the current page)
    breadcrumbItems.push({ label: movie.title });
    setBreadcrumbs(breadcrumbItems);
  }, [movie.title]);

  return <MovieDetails movie={movie} breadcrumbs={breadcrumbs} />;
};
