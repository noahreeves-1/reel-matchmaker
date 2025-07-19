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
  // Additional fields for detailed movie info
  runtime?: number;
  status?: string;
  tagline?: string;
  budget?: number;
  revenue?: number;
  genres?: Array<{ id: number; name: string }>;
  production_companies?: Array<{
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }>;
  production_countries?: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  spoken_languages?: Array<{
    iso_639_1: string;
    name: string;
  }>;
  original_language?: string;
  original_title?: string;
  adult?: boolean;
  video?: boolean;
  release_dates?: {
    results: Array<{
      iso_3166_1: string;
      release_dates: Array<{
        certification: string;
        release_date: string;
        type: number;
      }>;
    }>;
  };
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
      order: number;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
      profile_path: string | null;
    }>;
  };
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      size: number;
      type: string;
      official: boolean;
    }>;
  };
  images?: {
    backdrops: Array<{
      file_path: string;
      width: number;
      height: number;
    }>;
    posters: Array<{
      file_path: string;
      width: number;
      height: number;
    }>;
  };
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
