// Frontend API calls to our Next.js API routes
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

import { TMDBResponse, TMDBMovie, TMDBGenresResponse } from "./tmdb";

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

export const getGenres = async (): Promise<TMDBGenresResponse> => {
  const response = await fetch("/api/genres");

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  const data = await response.json();

  return data;
};

export const getMoviesByGenre = async (
  genreId: number,
  page: number = 1
): Promise<TMDBResponse> => {
  const response = await fetch(`/api/genres/${genreId}?page=${page}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `HTTP error! status: ${response.status}`
    );
  }

  const data = await response.json();

  return data;
};
