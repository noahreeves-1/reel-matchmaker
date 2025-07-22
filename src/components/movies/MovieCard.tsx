"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { TMDBMovie } from "@/lib/tmdb";
import { getPosterUrl } from "@/lib/movieUtils";

// MOVIE CARD: Individual movie display component
// This component displays a single movie with poster, title, and rating
interface MovieCardProps {
  movie: TMDBMovie;
  isLoading?: boolean;
  userRating?: number;
  isInWantToWatch?: boolean;
  onOpenRatingModal?: () => void;
  onToggleWantToWatch?: (movie: TMDBMovie, isInWantToWatch: boolean) => void;
  isRatingLoading?: boolean;
  isWantToWatchLoading?: boolean;
}

export const MovieCard = ({
  movie,
  isLoading = false,
  userRating,
  isInWantToWatch = false,
  onOpenRatingModal,
  onToggleWantToWatch,
  isRatingLoading = false,
  isWantToWatchLoading = false,
}: MovieCardProps) => {
  const router = useRouter();

  // Add client-side only state to prevent hydration mismatches
  const [isClient, setIsClient] = useState(false);

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMovieClick = () => {
    // Set the current page path in sessionStorage before navigating
    if (typeof window !== "undefined") {
      sessionStorage.setItem("previousPage", window.location.pathname);
    }
    router.push(`/movies/${movie.id}`);
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
        <div className="relative aspect-[2/3] bg-slate-200 dark:bg-slate-700"></div>
        <div className="p-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow group">
      <div
        onClick={handleMovieClick}
        className="w-full text-left cursor-pointer"
      >
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={getPosterUrl(movie.poster_path)}
            alt={movie.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {isClient && onOpenRatingModal && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenRatingModal();
              }}
              disabled={isRatingLoading}
              className={`absolute top-2 left-2 p-1.5 rounded-full transition-colors ${
                isRatingLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : userRating
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-white/80 hover:bg-white text-gray-700 hover:text-yellow-600"
              }`}
            >
              {isRatingLoading ? (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : userRating ? (
                <span className="font-bold flex items-center justify-center w-4 h-4">
                  {userRating}
                </span>
              ) : (
                <svg
                  className="h-4 w-4 fill-none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              )}
            </button>
          )}
          {isClient && onToggleWantToWatch && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWantToWatch(movie, isInWantToWatch);
              }}
              disabled={isWantToWatchLoading}
              className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors ${
                isWantToWatchLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : isInWantToWatch
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-white/80 hover:bg-white text-gray-700 hover:text-red-500"
              }`}
            >
              {isWantToWatchLoading ? (
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className={`h-4 w-4 ${
                    isInWantToWatch ? "fill-current" : "fill-none"
                  }`}
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">
          {movie.title}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          {movie.release_date
            ? new Date(movie.release_date).getFullYear()
            : "Unknown"}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-slate-600 dark:text-slate-400">
            <span>
              {movie.vote_average !== null && movie.vote_average !== undefined
                ? `${movie.vote_average.toFixed(1)} ★ TMDB`
                : "N/A ★ TMDB"}
            </span>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-500">
            <span>
              {movie.vote_count
                ? movie.vote_count >= 1000
                  ? `${(movie.vote_count / 1000).toFixed(0)}K`
                  : movie.vote_count.toString()
                : "N/A"}{" "}
              votes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
