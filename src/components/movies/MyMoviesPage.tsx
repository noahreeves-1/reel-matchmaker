"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Header,
  Footer,
  MovieCard,
  LoadingSkeleton,
  ConfirmDialog,
} from "@/components/movies";
import { useRatedMovies } from "@/hooks";
import { useLocalStorage, STORAGE_KEYS } from "@/lib";
import { WantToWatchMovie } from "@/types/movie";
import { TMDBMovie } from "@/lib/tmdb";

// MY MOVIES PAGE: User's personal movie collection management
// This component displays and manages user's rated movies and want-to-watch list
export const MyMoviesPage = () => {
  const [activeTab, setActiveTab] = useState<"rated" | "wishlist">("rated");
  const [wantToWatchList, setWantToWatchList] = useLocalStorage<
    WantToWatchMovie[]
  >(STORAGE_KEYS.WANT_TO_WATCH, []);

  // Add client-side only state to prevent hydration mismatches
  const [isClient, setIsClient] = useState(false);

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

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRemoveFromWantToWatch = (movieId: number) => {
    setWantToWatchList((prev: WantToWatchMovie[]) =>
      prev.filter((wm: WantToWatchMovie) => wm.id !== movieId)
    );
  };

  const handleToggleWantToWatch = (
    movie: TMDBMovie,
    isInWantToWatch: boolean
  ) => {
    if (isInWantToWatch) {
      handleRemoveFromWantToWatch(movie.id);
    } else {
      const wantToWatchMovie: WantToWatchMovie = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || undefined,
        release_date: movie.release_date,
        addedAt: new Date().toISOString(),
      };
      setWantToWatchList((prev: WantToWatchMovie[]) => [
        ...prev,
        wantToWatchMovie,
      ]);
    }
  };

  // Show loading state until client-side hydration is complete
  if (!isClient) {
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
            Manage your rated movies and wish list
          </p>
        </div>

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
                        onClick={() => {
                          const movieDetail = movieDetails[ratedMovie.id];
                          const title =
                            movieDetail?.title || `Movie ${ratedMovie.id}`;
                          openConfirmDialog(ratedMovie.id, title);
                        }}
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
                  Add movies to your want to watch list to keep track of what
                  you want to watch!
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
                  // Convert WantToWatchMovie to TMDBMovie format for display
                  const movieDetail: TMDBMovie = {
                    id: wantToWatchItem.id,
                    title: wantToWatchItem.title,
                    poster_path: wantToWatchItem.poster_path || null,
                    backdrop_path: null,
                    release_date: wantToWatchItem.release_date || "",
                    overview: "",
                    vote_average: 0,
                    vote_count: 0,
                    genre_ids: [],
                    popularity: 0,
                  };

                  return (
                    <div key={wantToWatchItem.id} className="relative group">
                      <MovieCard
                        isLoading={false}
                        movie={movieDetail}
                        isInWantToWatch={true}
                        onToggleWantToWatch={handleToggleWantToWatch}
                        onOpenRatingModal={() => {}} // No-op since we're just displaying
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </>
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
