"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { TMDBMovie } from "@/lib/tmdb";

interface MovieCardProps {
  isLoading?: boolean;
  movie?: TMDBMovie;
  onRateMovie?: (movieId: number, rating: number) => void;
  userRating?: number;
  onOpenRatingModal?: (movie: TMDBMovie) => void;
}

export const MovieCard = ({
  isLoading = true,
  movie,
  onRateMovie,
  userRating,
  onOpenRatingModal,
}: MovieCardProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-pulse">
        <div className="aspect-[2/3] bg-slate-200 dark:bg-slate-700"></div>
        <div className="p-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <Link href={`/movies/${movie.id}`} className="block">
        <div className="relative aspect-[2/3] bg-slate-200 dark:bg-slate-700">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={movie.title}
              width={500}
              height={750}
              className="object-cover w-full h-full"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16vw"
              priority={false}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-500">
              <span className="text-sm">No Poster</span>
            </div>
          )}

          {/* Rating button overlay */}
          {isClient && (
            <button
              onClick={() => onOpenRatingModal?.(movie)}
              className={`absolute top-2 left-2 px-2 py-1 rounded-full flex items-center justify-center transition-all duration-200 ${
                userRating
                  ? "bg-yellow-500 text-white"
                  : "bg-white/80 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-yellow-500 hover:text-white"
              }`}
            >
              {userRating ? (
                <span className="text-xs font-medium">{userRating}/10</span>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              )}
            </button>
          )}

          {/* TMDB Rating overlay */}
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
            ⭐ {movie.vote_average.toFixed(1)}
          </div>
        </div>
      </Link>

      <div className="p-3">
        <h3 className="font-medium text-slate-900 dark:text-white text-sm line-clamp-2 mb-1">
          {movie.title}
        </h3>
        {movie.release_date && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {new Date(movie.release_date).getFullYear()}
          </p>
        )}
      </div>
    </div>
  );
};
