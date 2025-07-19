import { Suspense } from "react";
import { MovieApp } from "@/components";
import { LoadingSkeleton } from "@/components/common";

// Static metadata for SEO
export const metadata = {
  title: "ReelTaste - AI Movie Recommendations",
  description:
    "Discover your next favorite movie with AI-powered recommendations based on your taste",
  keywords: ["movies", "recommendations", "AI", "TMDB", "streaming"],
};

// Revalidate every hour for fresh movie data
export const revalidate = 3600;

// Pre-fetch initial popular movies for better performance
async function getInitialMovies() {
  try {
    // Use internal API route - more reliable for environment variables
    const response = await fetch("http://localhost:3000/api/movies?page=1", {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error("Failed to fetch movies");
    }

    const movies = await response.json();
    return movies;
  } catch (error) {
    console.error("Failed to fetch initial movies:", error);
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
}

export default async function Home() {
  // Pre-fetch initial movies for SSG/ISR
  const initialMovies = await getInitialMovies();

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MovieApp initialMovies={initialMovies} />
    </Suspense>
  );
}
