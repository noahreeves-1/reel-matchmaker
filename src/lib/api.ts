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
