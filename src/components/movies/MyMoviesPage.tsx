"use client";

import Link from "next/link";
import {
  Header,
  Footer,
  MovieCard,
  LoadingSkeleton,
  ConfirmDialog,
} from "@/components/movies";
import { useRatedMovies } from "@/hooks";

export const MyMoviesPage = () => {
  const {
    ratedMovies,
    movieDetails,
    isLoading,
    error,
    confirmDialog,
    openConfirmDialog,
    closeConfirmDialog,
    handleRemoveRating,
  } = useRatedMovies();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <LoadingSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            My Movies
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {ratedMovies.length === 0
              ? "You haven't rated any movies yet. Head back to Discover to start rating!"
              : `You've rated ${ratedMovies.length} movie${
                  ratedMovies.length === 1 ? "" : "s"
                }`}
          </p>
        </div>

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
                      onOpenRatingModal={() => {}} // No-op since we're just displaying
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
                    onClick={() =>
                      openConfirmDialog(ratedMovie.id, ratedMovie.title)
                    }
                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-sm transition-colors z-20 opacity-0 group-hover:opacity-100"
                    title="Remove rating"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />

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
      />
    </div>
  );
};
