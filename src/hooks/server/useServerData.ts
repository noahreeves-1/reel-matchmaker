import { TMDBResponse, TMDBMovie } from "@/lib/tmdb";

// SERVER-SIDE DATA FETCHING: Direct TMDB API calls for Server Components
// This file provides server-side functions for fetching movie data during build/request time
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Direct API calls, no caching, potential rate limiting
// - VERCEL OPTIMIZATIONS: Serverless functions, automatic scaling, global distribution
// - SCALE BREAKERS: TMDB rate limits, API downtime, cold starts
// - FUTURE IMPROVEMENTS: Add Redis caching, request batching, fallback data
//
// CURRENT USAGE: ISR page generation, server-side rendering
// ARCHITECTURE: Server Component → Direct TMDB API → Response

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/**
 * Server-side function for fetching initial popular movies
 * Used in Server Components for SSR/ISR
 */
export const getInitialMovies = async (): Promise<TMDBResponse> => {
  try {
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      throw new Error("TMDB API key not configured");
    }

    // Add timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 5000); // 5 second timeout

    const url = `${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=en-US&page=1`;

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`
      );
    }

    const movies = await response.json();
    return movies;
  } catch (error) {
    console.error("getInitialMovies: Error occurred:", error);
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
};

/**
 * Server-side function for fetching movie details with comprehensive data
 * Used in Server Components for SSR/ISR
 */
export const getMovieData = async (
  movieId: number
): Promise<TMDBMovie | null> => {
  try {
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      throw new Error("TMDB API key not configured");
    }

    // Fetch comprehensive movie data including credits, videos, and images
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${apiKey}&language=en-US&append_to_response=credits,videos,images,release_dates`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`
      );
    }

    const movie = await response.json();
    return movie;
  } catch (error) {
    console.error(`Failed to fetch movie ${movieId}:`, error);
    return null;
  }
};

/**
 * Server-side function for fetching movie details for user's rated movies
 * Used in Server Components for SSR
 */
export const getUserMovieDetails = async (movieIds: number[]) => {
  if (movieIds.length === 0) return {};

  try {
    const apiKey = process.env.TMDB_API_KEY;
    if (!apiKey) {
      throw new Error("TMDB API key not configured");
    }

    // Fetch movie details for all user's rated movies
    const movieDetailsPromises = movieIds.map(async (movieId) => {
      const response = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}?api_key=${apiKey}&language=en-US`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        return await response.json();
      }
      return null;
    });

    const movieDetails = await Promise.all(movieDetailsPromises);

    // Create a map of movie ID to movie details
    const movieDetailsMap: Record<number, TMDBMovie> = {};
    movieDetails.forEach((movie) => {
      if (movie) {
        movieDetailsMap[movie.id] = movie;
      }
    });

    return movieDetailsMap;
  } catch (error) {
    console.error("Failed to fetch user movie details:", error);
    return {};
  }
};
