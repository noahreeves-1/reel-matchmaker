"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MovieCard,
  LoadingSkeleton,
  ConfirmDialog,
  RatingModal,
} from "@/components/movies";
import { useRatedMoviesDb } from "@/hooks/user/useRatedMoviesDb";
import { useWantToWatchDb } from "@/hooks/user/useWantToWatchDb";
import { WantToWatchMovie, UserInitialData } from "@/types/movie";
import { TMDBMovie } from "@/lib/tmdb";
import { useMovieActionsDb } from "@/hooks/user/useMovieActionsDb";

// CLIENT COMPONENT: User interactions for my movies page
// This component handles all client-side interactions (tabs, rating, want-to-watch, modals)
// "use client" directive - runs in browser only
interface MyMoviesPageClientProps {
  initialData?: UserInitialData;
}

export const MyMoviesPageClient = ({
  initialData,
}: MyMoviesPageClientProps) => {
  // Using initialData from SSR to avoid unnecessary API calls
  const [activeTab, setActiveTab] = useState<"rated" | "wishlist">("rated");

  // Rating modal state
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    movie: TMDBMovie | null;
  }>({
    isOpen: false,
    movie: null,
  });

  // Database-based hooks with initial data from SSR
  const {
    ratedMovies,
    movieDetails,
    isLoading,
    error,
    confirmDialog,
    openConfirmDialog,
    closeConfirmDialog,
  } = useRatedMoviesDb(initialData);

  const { wantToWatchList, movieDetails: wantToWatchMovieDetails } =
    useWantToWatchDb(initialData);

  // Movie Actions Hook: Now includes optimistic updates
  const {
    rateMovie,
    removeRating,
    isRatingMovie,
    isRemovingRating,
    isTogglingWantToWatch,
    toggleWantToWatch,
  } = useMovieActionsDb();

  const handleToggleWantToWatch = async (
    movie: TMDBMovie,
    isInWantToWatch: boolean
  ) => {
    try {
      await toggleWantToWatch(movie, isInWantToWatch);
      // No need to manually refresh - React Query handles this with optimistic updates
    } catch (error) {
      console.error("Error toggling want-to-watch:", error);
    }
  };

  // Rating removal functionality with optimistic updates
  const handleRemoveRating = async (movieId: number) => {
    try {
      await removeRating(movieId, closeConfirmDialog);
      // No need to manually refresh - React Query handles this with optimistic updates
    } catch (error) {
      console.error("Error removing rating:", error);
    }
  };

  // Wrapper function for RatingModal's onRemoveRating prop
  const handleRemoveRatingFromModal = (movie: { id: number }) => {
    handleRemoveRating(movie.id);
  };

  // Rating functionality
  const handleOpenRatingModal = (movie: TMDBMovie) => {
    setRatingModal({
      isOpen: true,
      movie,
    });
  };

  const handleCloseRatingModal = () => {
    setRatingModal({
      isOpen: false,
      movie: null,
    });
  };

  const handleRateMovie = async (
    movie: {
      id: number;
      title: string;
      poster_path?: string | null;
      release_date?: string;
      overview?: string;
    },
    rating: number
  ) => {
    try {
      // Convert to TMDBMovie format
      const tmdbMovie: TMDBMovie = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || null,
        release_date: movie.release_date || "",
        overview: movie.overview || "",
        vote_average: 0,
        vote_count: 0,
        backdrop_path: null,
        genre_ids: [],
        popularity: 0,
        adult: false,
        original_language: "en",
        original_title: movie.title,
        video: false,
      };

      await rateMovie(tmdbMovie, rating);

      // Close the modal
      handleCloseRatingModal();
      // No need to manually refresh - React Query handles this with optimistic updates
    } catch (error) {
      console.error("Error rating movie:", error);
    }
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          Error Loading Movies
        </h3>
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          There was an error loading your rated movies. Please try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-slate-200 dark:bg-slate-700 rounded-lg p-1 mb-8">
        <button
          onClick={() => setActiveTab("rated")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === "rated"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Rated Movies ({ratedMovies.length})
        </button>
        <button
          onClick={() => setActiveTab("wishlist")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            activeTab === "wishlist"
              ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm"
              : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Want to Watch ({wantToWatchList.length})
        </button>
      </div>

      {/* Rated Movies Tab */}
      {activeTab === "rated" && (
        <>
          {ratedMovies.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎬</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No Rated Movies Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Start rating movies to see them here and get personalized
                recommendations!
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                Discover Movies
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {ratedMovies.map((ratedMovie) => {
                const movieDetail = movieDetails[ratedMovie.id];

                return (
                  <div key={ratedMovie.id} className="relative group">
                    {movieDetail ? (
                      <MovieCard
                        isLoading={false}
                        movie={movieDetail}
                        userRating={ratedMovie.rating}
                        onOpenRatingModal={() =>
                          handleOpenRatingModal(movieDetail)
                        }
                        isRatingLoading={isRatingMovie}
                        isWantToWatchLoading={isTogglingWantToWatch}
                      />
                    ) : (
                      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="relative aspect-[2/3] bg-slate-200 dark:bg-slate-700">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => {
                        const movieDetail = movieDetails[ratedMovie.id];
                        const title =
                          movieDetail?.title || `Movie ${ratedMovie.id}`;
                        openConfirmDialog(ratedMovie.id, title);
                      }}
                      className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm transition-colors z-20"
                      title="Remove rating"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Want to Watch Tab */}
      {activeTab === "wishlist" && (
        <>
          {wantToWatchList.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💝</div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                No Want to Watch Items Yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Add movies to your want to watch list to keep track of what you
                want to watch!
              </p>
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
              >
                Discover Movies
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {wantToWatchList.map((wantToWatchItem: WantToWatchMovie) => {
                // Get full movie details from the hook
                const movieDetail = wantToWatchMovieDetails[wantToWatchItem.id];

                // Check if this movie is also rated
                const ratedMovie = ratedMovies.find(
                  (rm) => rm.id === wantToWatchItem.id
                );
                const userRating = ratedMovie?.rating;

                return (
                  <div key={wantToWatchItem.id} className="relative group">
                    {movieDetail ? (
                      <MovieCard
                        isLoading={false}
                        movie={movieDetail}
                        userRating={userRating}
                        isInWantToWatch={true}
                        onToggleWantToWatch={(movie, isInWantToWatch) =>
                          handleToggleWantToWatch(movie, isInWantToWatch)
                        }
                        onOpenRatingModal={() =>
                          handleOpenRatingModal(movieDetail)
                        }
                        isRatingLoading={isRatingMovie}
                        isWantToWatchLoading={isTogglingWantToWatch}
                      />
                    ) : (
                      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                        <div className="relative aspect-[2/3] bg-slate-200 dark:bg-slate-700">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                          </div>
                        </div>
                        <div className="p-3">
                          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={() =>
          confirmDialog.movieId && handleRemoveRating(confirmDialog.movieId)
        }
        title="Remove Rating"
        message={`Are you sure you want to remove your rating for "${confirmDialog.movieTitle}"?`}
        confirmText="Remove"
        cancelText="Cancel"
        isLoading={isRemovingRating}
        loadingText="Removing..."
      />

      {/* Rating Modal */}
      {ratingModal.movie && (
        <RatingModal
          movie={ratingModal.movie}
          isOpen={ratingModal.isOpen}
          onClose={handleCloseRatingModal}
          onRate={handleRateMovie}
          onRemoveRating={handleRemoveRatingFromModal}
          currentRating={
            ratedMovies.find((rm) => rm.id === ratingModal.movie!.id)?.rating
          }
        />
      )}
    </>
  );
};
