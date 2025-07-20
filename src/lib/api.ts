// CLIENT-SIDE API WRAPPER: Frontend API calls to our Next.js API routes
// This file provides a clean interface for client components to make API calls
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Additional network hop, depends on our API routes, no direct TMDB access
// - VERCEL OPTIMIZATIONS: CDN caching for API responses, automatic scaling
// - SCALE BREAKERS: Our API rate limits, network latency, API route failures
// - FUTURE IMPROVEMENTS: Add client-side caching, request deduplication, error retry logic
//
// CURRENT USAGE: Movie fetching, search, details
// ARCHITECTURE: Client → Next.js API → TMDB → Response

import { TMDBResponse, TMDBMovie } from "./tmdb";

export const getPopularMovies = async (
  page: number = 1
): Promise<TMDBResponse> => {
  const response = await fetch(`/api/movies?page=${page}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  const data = await response.json();

  return data;
};

export const searchMovies = async (
  query: string,
  page: number = 1
): Promise<TMDBResponse> => {
  const response = await fetch(
    `/api/movies/search?query=${encodeURIComponent(query)}&page=${page}`
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  const data = await response.json();

  return data;
};

export const getMovieDetails = async (movieId: number): Promise<TMDBMovie> => {
  const response = await fetch(`/api/movies/${movieId}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  const data = await response.json();
  return data;
};

/**
 * Utility function to invalidate Next.js cache for a specific movie
 * This can be called when you need to refresh movie data
 */
export const invalidateMovieCache = async (movieId: number): Promise<void> => {
  try {
    // Call the revalidate API route (you'll need to create this)
    await fetch(`/api/revalidate?tag=movie-${movieId}`, { method: "POST" });
  } catch (error) {
    console.warn("Failed to invalidate movie cache:", error);
  }
};

/**
 * Utility function to prefetch movie details for better UX
 */
export const prefetchMovieDetails = async (movieId: number): Promise<void> => {
  try {
    // Prefetch the movie details
    await getMovieDetails(movieId);
  } catch (error) {
    console.warn("Failed to prefetch movie details:", error);
  }
};
