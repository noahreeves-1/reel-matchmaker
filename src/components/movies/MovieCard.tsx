import Image from "next/image";
import { TMDBMovie } from "@/lib/tmdb";
import { getPosterUrl } from "@/lib/movieUtils";
import { MovieCardClient } from "./MovieCardClient";

// SERVER COMPONENT: Static movie card content
// This component handles all server-side rendering (SEO, static content)
// No "use client" directive - runs on server
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
      {/* Static content - renders on server */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <Image
          src={getPosterUrl(movie.poster_path)}
          alt={movie.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        {/* Client component handles all interactive elements */}
        <MovieCardClient
          movie={movie}
          userRating={userRating}
          isInWantToWatch={isInWantToWatch}
          onOpenRatingModal={onOpenRatingModal}
          onToggleWantToWatch={onToggleWantToWatch}
          isRatingLoading={isRatingLoading}
          isWantToWatchLoading={isWantToWatchLoading}
        />
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
