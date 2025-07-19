const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genre_ids: number[];
  popularity: number;
}

export interface TMDBResponse {
  page: number;
  results: TMDBMovie[];
  total_pages: number;
  total_results: number;
}

export interface TMDBConfig {
  images: {
    base_url: string;
    secure_base_url: string;
    poster_sizes: string[];
    backdrop_sizes: string[];
  };
}

const getApiKey = (): string => {
  // Only use server-side API key for security
  const apiKey = process.env.TMDB_API_KEY || "";
  if (!apiKey) {
    console.warn(
      "TMDB API key not found. Please set TMDB_API_KEY in your environment variables."
    );
  }
  return apiKey;
};

const makeTMDBRequest = async <T>(endpoint: string): Promise<T> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("TMDB API key not configured");
  }

  const url = `${TMDB_BASE_URL}${endpoint}?api_key=${apiKey}&language=en-US`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("TMDB API request failed:", error);
    throw error;
  }
};

export const getPopularMovies = async (
  page: number = 1
): Promise<TMDBResponse> => {
  return makeTMDBRequest<TMDBResponse>(`/movie/popular?page=${page}`);
};

export const searchMovies = async (
  query: string,
  page: number = 1
): Promise<TMDBResponse> => {
  const encodedQuery = encodeURIComponent(query);
  return makeTMDBRequest<TMDBResponse>(
    `/search/movie?query=${encodedQuery}&page=${page}`
  );
};

export const getMovieDetails = async (movieId: number): Promise<TMDBMovie> => {
  return makeTMDBRequest<TMDBMovie>(`/movie/${movieId}`);
};

export const getConfiguration = async (): Promise<TMDBConfig> => {
  return makeTMDBRequest<TMDBConfig>("/configuration");
};

// Utility functions for image URLs
export const getPosterUrl = (
  posterPath: string | null,
  size: string = "w500"
): string | null => {
  if (!posterPath) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${posterPath}`;
};

export const getBackdropUrl = (
  backdropPath: string | null,
  size: string = "w1280"
): string | null => {
  if (!backdropPath) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${backdropPath}`;
};
