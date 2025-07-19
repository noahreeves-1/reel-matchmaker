import { TMDBResponse, TMDBMovie } from "@/lib/tmdb";

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

    const response = await fetch(
      `${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=en-US&page=1`,
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
    console.error("Failed to fetch initial movies:", error);
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
};

/**
 * Server-side function for fetching movie details
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

    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${apiKey}&language=en-US`,
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
