"use client";

import {
  Header,
  Hero,
  MovieGrid,
  RecommendationsSection,
  Footer,
  RatingModal,
  ErrorDisplay,
} from "@/components/movies";
import { TMDBMovie, handleApiError } from "@/lib";
import {
  useMovies,
  useRatingModal,
  useRecommendations,
  useMovieActions,
} from "@/hooks";
import { TMDBResponse } from "@/lib/tmdb";

// RENDERING STRATEGY: Client-Side Rendering (CSR) with Server Data
// - This component is rendered on the client side for interactivity
// - Receives initial data from server (ISR pages) for fast initial load
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
  initialMovies?: TMDBResponse;
}

export const MovieApp = ({ initialMovies }: MovieAppProps) => {
  // Custom Hooks: These encapsulate complex logic and state management
  // Each hook has a single responsibility and can be reused across components

  // Recommendations Hook: Manages AI-powered movie recommendations
  const {
    recommendations,
    isGeneratingRecommendations,
    generateRecommendations,
    ratedMoviesCount,
    wantToWatchCount,
  } = useRecommendations();

  // Movie Actions Hook: Manages user interactions with movies (rating, want-to-watch)
  const {
    ratedMovies,
    wantToWatchList,
    rateMovie,
    toggleWantToWatch,
    getRating,
  } = useMovieActions();

  // Movies Hook: Manages movie data fetching, search, and pagination
  // This hook handles both popular movies and search results
  const {
    movies,
    isLoadingMovies,
    movieError,
    // hasMoreMovies, // Unused - keeping for future pagination feature
    // isLoadingMore, // Unused - keeping for future pagination feature
    // loadMoreMovies, // Unused - keeping for future pagination feature
    refetch,
    searchQuery,
    isSearching,
    performSearch,
    clearSearch,
  } = useMovies(initialMovies);

  // Rating Modal Hook: Manages the rating modal state and interactions
  const { isOpen, movieId, openModal, closeModal } = useRatingModal();

  const handleRateMovie = (movieId: number, rating: number) => {
    // First try to find the movie in the main movies array
    let movie = movies.find((m: TMDBMovie) => m.id === movieId);

    // If not found in main movies, try to find it in recommendations
    if (!movie) {
      const recommendation = recommendations.find((rec) => rec.id === movieId);
      if (recommendation) {
        // Convert Recommendation to TMDBMovie format
        movie = {
          id: recommendation.id,
          title: recommendation.title,
          poster_path: recommendation.poster_path || null,
          backdrop_path: null,
          release_date: recommendation.release_date || "",
          overview: "",
          vote_average: 0,
          vote_count: 0,
          genre_ids: [],
          popularity: 0,
        };
      }
    }

    if (!movie) {
      if (process.env.NODE_ENV === "development") {
        console.warn(
          `⚠️ Movie with ID ${movieId} not found in movies or recommendations`
        );
      }
      return;
    }

    rateMovie(movie, rating);
  };

  const handleToggleWantToWatch = (
    movie: TMDBMovie
    // isInWantToWatch: boolean // Unused parameter - keeping for future use
  ) => {
    toggleWantToWatch(movie);
  };

  const handleOpenRatingModal = (movie: TMDBMovie) => {
    openModal(movie.id);
  };

  const handleCloseRatingModal = () => {
    closeModal();
  };

  const handleGenerateRecommendations = async () => {
    try {
      await generateRecommendations();
    } catch (error) {
      handleApiError(error);
      // You could add a toast notification here for better UX
      // For now, we'll let the error bubble up to be handled by the UI
    }
  };

  const currentRating = movieId ? getRating(movieId) : undefined;

  const handleOpenRatingModalById = (movieId: number) => {
    const movie = movies.find((m) => m.id === movieId);
    if (movie) {
      handleOpenRatingModal(movie);
    }
  };

  const handleRateMovieForModal = (
    movie: {
      id: number;
      title: string;
      poster_path?: string | null;
      release_date?: string;
      overview?: string;
    },
    rating: number
  ) => {
    handleRateMovie(movie.id, rating);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />

      {/* Full-width Hero Section */}
      <Hero
        onSearch={performSearch}
        onClear={clearSearch}
        isLoading={isSearching}
        searchQuery={searchQuery}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RecommendationsSection
          ratedMoviesCount={ratedMoviesCount}
          ratedMovies={ratedMovies}
          wantToWatchCount={wantToWatchCount}
          onGenerateRecommendations={handleGenerateRecommendations}
          onRateMovie={handleRateMovie}
          isLoading={isGeneratingRecommendations}
          recommendations={recommendations}
        />
        {movieError ? (
          <ErrorDisplay error={movieError} onRetry={refetch} />
        ) : (
          <MovieGrid
            isLoading={isLoadingMovies || isSearching}
            movies={movies}
            userRatings={Object.fromEntries(
              ratedMovies.map((movie) => [movie.id, movie.rating])
            )}
            wantToWatchList={wantToWatchList.map((movie) => movie.id)}
            onOpenRatingModal={handleOpenRatingModalById}
            onToggleWantToWatch={handleToggleWantToWatch}
          />
        )}
      </main>

      <Footer />

      {/* Rating Modal */}
      {movieId &&
        (() => {
          const movie = movies.find((m) => m.id === movieId);
          return movie ? (
            <RatingModal
              movie={movie}
              isOpen={isOpen}
              onClose={handleCloseRatingModal}
              onRate={handleRateMovieForModal}
              currentRating={currentRating ?? undefined}
            />
          ) : null;
        })()}
    </div>
  );
};
