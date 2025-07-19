export interface Movie {
  id: number;
  title: string;
  poster_path?: string;
  release_date?: string;
  overview?: string;
  vote_average?: number;
  genre_ids?: number[];
}

export interface RatedMovie {
  id: number;
  title: string;
  rating: number; // 1-10 rating
  poster_path?: string;
  release_date?: string;
}

export interface Recommendation {
  title: string;
  reason: string;
}

export interface TMDBResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}
