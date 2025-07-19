import { Suspense } from "react";
import { MovieApp } from "@/components";
import { LoadingSkeleton } from "@/components/common";
import { getInitialMovies } from "@/hooks/server";

// Static metadata for SEO
export const metadata = {
  title: "Reel Matchmaker - AI Movie Recommendations",
  description:
    "Discover your next favorite movie with AI-powered recommendations based on your taste",
  keywords: ["movies", "recommendations", "AI", "TMDB", "streaming"],
};

// Revalidate every hour for fresh movie data
export const revalidate = 3600;

export default async function Home() {
  // Pre-fetch initial movies for SSG/ISR
  const initialMovies = await getInitialMovies();

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MovieApp initialMovies={initialMovies} />
    </Suspense>
  );
}
