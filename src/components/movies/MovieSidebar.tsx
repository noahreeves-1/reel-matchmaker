import Image from "next/image";
import { TMDBMovie } from "@/lib/tmdb";
import { getPosterUrl } from "@/lib/tmdb";
import { formatRuntime } from "@/lib/movieUtils";

interface MovieSidebarProps {
  movie: TMDBMovie;
}

export const MovieSidebar = ({ movie }: MovieSidebarProps) => {
  const posterUrl = getPosterUrl(movie.poster_path, "w500");

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-8">
        {posterUrl ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            width={500}
            height={750}
            className="w-full rounded-lg shadow-lg"
          />
        ) : (
          <div className="w-full aspect-[2/3] bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
            <span className="text-slate-400">No Poster</span>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">
              TMDB Rating
            </span>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⭐</span>
              <span className="font-semibold">
                {movie.vote_average.toFixed(1)}/10
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 dark:text-slate-400">Votes</span>
            <span className="font-semibold">
              {movie.vote_count.toLocaleString()}
            </span>
          </div>
          {movie.runtime && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                Runtime
              </span>
              <span className="font-semibold">
                {formatRuntime(movie.runtime)}
              </span>
            </div>
          )}
          {movie.release_date && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">
                Release Date
              </span>
              <span className="font-semibold">
                {new Date(movie.release_date).toLocaleDateString()}
              </span>
            </div>
          )}
          {movie.status && (
            <div className="flex items-center justify-between">
              <span className="text-slate-600 dark:text-slate-400">Status</span>
              <span className="font-semibold">{movie.status}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
