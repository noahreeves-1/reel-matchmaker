// TypeScript type definitions for movie-related data
// Note: TMDBMovie and TMDBResponse are defined in @/lib/tmdb.ts (more complete versions)

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
  poster_path?: string | null;
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

// Type definitions for database entities
// These match the Drizzle schema types for type safety

export interface UserRating {
  id: string;
  userId: string;
  movieId: number;
  rating: number;
  ratedAt: Date;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface WantToWatch {
  id: string;
  userId: string;
  movieId: number;
  addedAt: Date;
  priority: number | null;
  notes?: string | null;
  movieTitle?: string | null;
  posterPath?: string | null;
  releaseDate?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// For SSR data passing between server and client
export interface UserInitialData {
  ratings: UserRating[];
  wantToWatch: WantToWatch[];
}
