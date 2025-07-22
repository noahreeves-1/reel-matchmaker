import { auth } from "@/auth";
import type { UserInitialData } from "@/types/movie";
import { TMDBResponse, TMDBMovie, TMDBGenresResponse } from "@/lib/tmdb";

// SERVER-SIDE FUNCTIONS: All server-side operations for SSR/ISR
// This file consolidates all server-side functions used in Server Components
//
// TWO MAIN CATEGORIES:
// 1. USER AUTHENTICATION & DATABASE OPERATIONS (uses NextAuth auth())
// 2. EXTERNAL API CALLS (TMDB API calls)
//
// USAGE: Server Components, API Routes, Server Actions
// NEVER IMPORT IN CLIENT COMPONENTS

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// ============================================================================
// USER AUTHENTICATION & DATABASE OPERATIONS
// ============================================================================

/**
 * Get user's rated movies and want-to-watch list from database
 * Uses NextAuth's server-side auth() function for authentication
 * Returns user-specific data for SSR
 */
export const getUserRatedMovies = async (): Promise<UserInitialData> => {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { ratings: [], wantToWatch: [] };
    }

    // Use dynamic imports like the API routes to avoid isTTY errors
    const { getUserRatings, getWantToWatchList } = await import(
      "@/lib/db-utils"
    );

    const userEmail = session.user.email;
    const ratings = await getUserRatings(userEmail);
    const wantToWatch = await getWantToWatchList(userEmail);

    return {
      ratings: ratings || [],
      wantToWatch: wantToWatch || [],
    };
  } catch (error) {
    console.error("Failed to fetch user movies:", error);
    return { ratings: [], wantToWatch: [] };
  }
};

// ============================================================================
// EXTERNAL API CALLS (TMDB)
// ============================================================================

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

/**
 * Server-side function for fetching movie genres
 * Used in Server Components for SSR/ISR
 */
export const getInitialGenres = async (): Promise<TMDBGenresResponse> => {
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

    const url = `${TMDB_BASE_URL}/genre/movie/list?api_key=${apiKey}&language=en-US`;

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

    const genres = await response.json();
    return genres;
  } catch (error) {
    console.error("getInitialGenres: Error occurred:", error);
    return { genres: [] };
  }
};

/**
 * Server-side function for fetching movies by genre
 * Used in Server Components for SSR/ISR
 */
export const getMoviesByGenreData = async (
  genreId: number,
  page: number = 1
): Promise<TMDBResponse> => {
  try {
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      throw new Error("TMDB API key not configured");
    }

    // Fetch movies by genre with popularity sorting
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&language=en-US&with_genres=${genreId}&page=${page}&sort_by=popularity.desc`,
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

    const movies = await response.json();
    return movies;
  } catch (error) {
    console.error(`Failed to fetch movies for genre ${genreId}:`, error);
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
};
