// MOVIE TYPES: TypeScript type definitions for movie-related data
// This file defines the structure of movie data used throughout the application

export interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  overview: string;
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

export interface RatedMovie {
  id: number;
  title: string;
  rating: number;
  ratedAt: string;
  release_date?: string;
}

export interface WantToWatchMovie {
  id: number;
  title: string;
  poster_path?: string;
  release_date?: string;
  addedAt: string;
}

export interface MovieRecommendation {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  vote_count: number;
  reason: string;
  personalizedReason?: string;
  matchScore?: number;
  matchLevel?: "LOVE IT" | "LIKE IT" | "MAYBE" | "RISKY";
  enhancedReason?: string;
  revenue?: number;
  popularity?: number;
}
