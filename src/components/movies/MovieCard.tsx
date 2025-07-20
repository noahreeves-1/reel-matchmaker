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
}

export const MovieCard = ({
  movie,
  isLoading = false,
  userRating,
  isInWantToWatch = false,
  onOpenRatingModal,
  onToggleWantToWatch,
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
      <button onClick={handleMovieClick} className="w-full text-left">
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={getPosterUrl(movie.poster_path)}
            alt={movie.title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          />
          {isClient && userRating && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded text-sm font-medium">
              ★ {userRating}
            </div>
          )}
          {isClient && isInWantToWatch && (
            <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
              💝
            </div>
          )}
        </div>
      </button>

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
            <span>★ {movie.vote_average.toFixed(1)}</span>
          </div>

          <div className="flex space-x-1">
            {isClient && onOpenRatingModal && (
              <button
                onClick={onOpenRatingModal}
                className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
              >
                Rate
              </button>
            )}
            {isClient && onToggleWantToWatch && (
              <button
                onClick={() => onToggleWantToWatch(movie, isInWantToWatch)}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  isInWantToWatch
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-500 hover:bg-gray-600 text-white"
                }`}
              >
                {isInWantToWatch ? "Remove" : "Watch"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
