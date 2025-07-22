"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { TMDBMovie } from "@/lib/tmdb";
import { MovieHero } from "./MovieHero";
import { MovieSidebar } from "./MovieSidebar";
import { MovieCast } from "./MovieCast";
import { MovieTrailers } from "./MovieTrailers";
import { RatingModal } from "./RatingModal";
import { formatCurrency, getDirectors, getWriters } from "@/lib/movieUtils";
import { useRatedMoviesDb } from "@/hooks/user/useRatedMoviesDb";
import { useWantToWatchDb } from "@/hooks/user/useWantToWatchDb";
import { useMovieActionsDb } from "@/hooks/user/useMovieActionsDb";
import { useSession } from "next-auth/react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface MovieDetailsProps {
  movie: TMDBMovie;
  breadcrumbs?: BreadcrumbItem[];
}

export const MovieDetails = ({ movie, breadcrumbs }: MovieDetailsProps) => {
  // Add client-side only state to prevent hydration mismatches
  const [isClient, setIsClient] = useState(false);

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

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Get current user rating and want-to-watch status
  const currentRating = ratedMovies.find((rm) => rm.id === movie.id)?.rating;
  const isInWantToWatch = wantToWatchList.some((wt) => wt.id === movie.id);

  // Debug logging
  console.log("Movie ID:", movie.id);
  console.log("Rated Movies:", ratedMovies);
  console.log("Current Rating:", currentRating);

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            {breadcrumbs ? (
              <>
                {breadcrumbs.map((item, index) => (
                  <li key={index}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-slate-900 dark:text-white font-medium">
                        {item.label}
                      </span>
                    )}
                    {index < breadcrumbs.length - 1 && (
                      <span className="text-slate-400 ml-2">/</span>
                    )}
                  </li>
                ))}
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/"
                    className="hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <span className="text-slate-400 ml-2">/</span>
                </li>
                <li>
                  <Link
                    href="/movies"
                    className="hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Popular Movies
                  </Link>
                </li>
                <li>
                  <span className="text-slate-400 ml-2">/</span>
                </li>
                <li className="text-slate-900 dark:text-white font-medium">
                  {movie.title}
                </li>
              </>
            )}
          </ol>
        </nav>
      </div>

      <MovieHero movie={movie} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <MovieSidebar movie={movie} />

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* User Actions Section */}
            {isClient && (
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
            )}

            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Overview
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {movie.overview || "No overview available."}
              </p>
            </section>

            {/* Financial Information */}
            {(movie.budget || movie.revenue) && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Financial Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {movie.budget && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Budget
                      </h3>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(movie.budget)}
                      </p>
                    </div>
                  )}
                  {movie.revenue && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Revenue
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(movie.revenue)}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            <MovieCast movie={movie} />

            {/* Crew */}
            {(getDirectors(movie).length > 0 ||
              getWriters(movie).length > 0) && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Crew
                </h2>
                <div className="space-y-4">
                  {getDirectors(movie).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Director{getDirectors(movie).length > 1 ? "s" : ""}
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300">
                        {getDirectors(movie)
                          .map((director: { name: string }) => director.name)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                  {getWriters(movie).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Writer{getWriters(movie).length > 1 ? "s" : ""}
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300">
                        {getWriters(movie)
                          .map((writer: { name: string }) => writer.name)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            <MovieTrailers movie={movie} />

            {/* Production Information */}
            {(movie.production_companies?.length ||
              movie.production_countries?.length ||
              movie.spoken_languages?.length) && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Production Information
                </h2>
                <div className="space-y-4">
                  {movie.production_companies?.length && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Production Companies
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300">
                        {movie.production_companies
                          .map((company) => company.name)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                  {movie.production_countries?.length && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Production Countries
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300">
                        {movie.production_countries
                          .map((country) => country.name)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                  {movie.spoken_languages?.length && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Spoken Languages
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300">
                        {movie.spoken_languages
                          .map((lang) => lang.name)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
};
