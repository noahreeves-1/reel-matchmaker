"use client";

import Link from "next/link";
import { useState } from "react";
import { TMDBMovie } from "@/lib/tmdb";
import { RatingModal } from "./RatingModal";
import { useRatedMoviesDb } from "@/hooks/user/useRatedMoviesDb";
import { useWantToWatchDb } from "@/hooks/user/useWantToWatchDb";
import { useMovieActionsDb } from "@/hooks/user/useMovieActionsDb";
import { useSession } from "next-auth/react";

// CLIENT COMPONENT: User interactions for movie details
// This component handles all client-side interactions (rating, want-to-watch, modals)
// "use client" directive - runs in browser only
interface MovieDetailsClientProps {
  movie: TMDBMovie;
}

export const MovieDetailsClient = ({ movie }: MovieDetailsClientProps) => {
  // Rating modal state
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    movie: TMDBMovie | null;
  }>({
    isOpen: false,
    movie: null,
  });

  // Session and authentication
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isLoading = status === "loading";

  // Database-based hooks for user data
  const { ratedMovies } = useRatedMoviesDb();
  const { wantToWatchList } = useWantToWatchDb();
  const { rateMovie, removeRating, toggleWantToWatch } = useMovieActionsDb();

  // Get current user rating and want-to-watch status
  const currentRating = ratedMovies.find((rm) => rm.id === movie.id)?.rating;
  const isInWantToWatch = wantToWatchList.some((wt) => wt.id === movie.id);

  // Rating functionality
  const handleOpenRatingModal = () => {
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
      await rateMovie(movie as TMDBMovie, rating);
      // Close the modal
      handleCloseRatingModal();
      // No need to manually refresh - React Query handles this with optimistic updates
    } catch (error) {
      console.error("Error rating movie:", error);
    }
  };

  // Rating removal functionality with optimistic updates
  const handleRemoveRatingFromModal = async (movie: { id: number }) => {
    try {
      await removeRating(movie.id);
      // No need to manually refresh - React Query handles this with optimistic updates
    } catch (error) {
      console.error("Error removing rating:", error);
    }
  };

  const handleToggleWantToWatch = async () => {
    try {
      await toggleWantToWatch(movie, isInWantToWatch);
      // No need to manually refresh - React Query handles this
    } catch (error) {
      console.error("Error toggling want-to-watch:", error);
    }
  };

  return (
    <>
      {/* User Actions Section */}
      <section className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Your Actions
        </h2>
        {isLoading ? (
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
            Loading...
          </div>
        ) : isAuthenticated ? (
          <div className="flex flex-wrap gap-4">
            {/* Rating Button */}
            <button
              onClick={handleOpenRatingModal}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                isLoading
                  ? "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  : currentRating
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-yellow-500 hover:text-white"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  Rating...
                </>
              ) : currentRating ? (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Rated {currentRating}/10
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Rate This Movie
                </>
              )}
            </button>

            {/* Want to Watch Button */}
            <button
              onClick={handleToggleWantToWatch}
              disabled={isLoading}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                isLoading
                  ? "bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed"
                  : isInWantToWatch
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-500 hover:text-white"
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  {isInWantToWatch ? "Removing..." : "Adding..."}
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill={isInWantToWatch ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                  {isInWantToWatch
                    ? "Remove from Watchlist"
                    : "Add to Watchlist"}
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              Sign in to rate movies and manage your watchlist
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Sign In
            </Link>
          </div>
        )}
      </section>

      {/* Rating Modal */}
      {ratingModal.isOpen && ratingModal.movie && (
        <RatingModal
          isOpen={ratingModal.isOpen}
          onClose={handleCloseRatingModal}
          movie={ratingModal.movie}
          onRate={handleRateMovie}
          onRemoveRating={handleRemoveRatingFromModal}
          currentRating={currentRating}
        />
      )}
    </>
  );
};
