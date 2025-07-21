"use client";

import { TMDBResponse } from "@/lib/tmdb";
import { useMovies } from "@/hooks";
import { useRatedMoviesDb } from "@/hooks/user/useRatedMoviesDb";
import { useWantToWatchDb } from "@/hooks/user/useWantToWatchDb";
import { useRecommendations } from "@/hooks/user/useRecommendations";
import { useRatingModal } from "@/hooks/ui/useRatingModal";
import { useMovieActionsDb } from "@/hooks/user/useMovieActionsDb";
import { MovieGrid } from "@/components/movies";

// MOVIE APP: Main interactive component with server-side data fetching
// This component handles its own data fetching to keep the page static
// RENDERING STRATEGY: Client-Side Rendering (CSR) with Server Data
// - This component is rendered on the client side for interactivity
// - Fetches initial data from server (ISR pages) for fast initial load
// - Benefits: Interactive features, real-time user data, fast subsequent navigation
// - Perfect for: Interactive pages that need user interactions and localStorage access
// - Why CSR? We need hooks, event handlers, and localStorage for user interactions
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Larger bundle size, no SSR benefits, localStorage limitations
// - VERCEL OPTIMIZATIONS: Static asset optimization, CDN caching, client-side processing
// - SCALE BREAKERS: localStorage size limits, no server-side user state, limited SEO
// - FUTURE IMPROVEMENTS: Add server-side user state, hybrid rendering, better SEO

interface MovieAppProps {
  // No initialMovies prop - component fetches its own data
}

export const MovieApp = ({}: MovieAppProps) => {
  // Custom Hooks: These encapsulate complex logic and state management
  // Each hook has a single responsibility and can be reused across components

  // Database-backed hooks for user data
  const { ratedMovies, loadRatedMovies } = useRatedMoviesDb();
  const { wantToWatchList, loadWantToWatchList } = useWantToWatchDb();

  // Recommendations Hook: Manages AI-powered movie recommendations
  // Pass the actual ratedMovies and wantToWatchList to ensure consistency
  const {
    recommendations,
    isGeneratingRecommendations,
    generateRecommendations,
  } = useRecommendations(ratedMovies, wantToWatchList);

  // Movie Actions Hook: Manages user interactions with movies (rating, want-to-watch)
  const { rateMovie, toggleWantToWatch } = useMovieActionsDb();

  // Movies Hook: Manages movie data fetching, search, and pagination
  // This hook handles both popular movies and search results
  const {
    movies,
    isLoadingMovies,
    movieError,
    hasMoreMovies,
    searchQuery,
    isSearching,
    performSearch,
    clearSearch,
  } = useMovies(); // No initial data - fetches from API

  // Rating Modal Hook: Manages the rating modal state and interactions
  const { isOpen, movieId, openModal, closeModal } = useRatingModal();

  return (
    <div className="min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MovieGrid
          isLoading={isLoadingMovies || isSearching}
          movies={movies}
          userRatings={Object.fromEntries(
            ratedMovies.map((movie) => [movie.id, movie.rating])
          )}
          wantToWatchList={wantToWatchList.map((movie) => movie.id)}
          onOpenRatingModal={(movieId) => openModal(movieId)}
          onToggleWantToWatch={toggleWantToWatch}
          ratingLoadingStates={{}}
          wantToWatchLoadingStates={{}}
          hasMoreMovies={hasMoreMovies}
          isLoadingMore={false}
          onLoadMore={() => {}}
          onSearch={performSearch}
          onClear={clearSearch}
          searchQuery={searchQuery}
          isSearchLoading={isSearching}
        />
      </main>
    </div>
  );
};
