"use client";

import { useRouter } from "next/navigation";
import { TMDBMovie } from "@/lib/tmdb";

// CLIENT COMPONENT: Interactive movie card elements
// This component handles all client-side interactions (navigation, user actions)
// "use client" directive - runs in browser only
interface MovieCardClientProps {
  movie: TMDBMovie;
  userRating?: number;
  isInWantToWatch?: boolean;
  onOpenRatingModal?: () => void;
  onToggleWantToWatch?: (movie: TMDBMovie, isInWantToWatch: boolean) => void;
  isRatingLoading?: boolean;
  isWantToWatchLoading?: boolean;
}

export const MovieCardClient = ({
  movie,
  userRating,
  isInWantToWatch = false,
  onOpenRatingModal,
  onToggleWantToWatch,
  isRatingLoading = false,
  isWantToWatchLoading = false,
}: MovieCardClientProps) => {
  const router = useRouter();

  const handleMovieClick = () => {
    // Set the current page path in sessionStorage before navigating
    if (typeof window !== "undefined") {
      sessionStorage.setItem("previousPage", window.location.pathname);
    }
    router.push(`/movies/${movie.id}`);
  };

  return (
    <>
      {/* Clickable overlay for navigation */}
      <div
        onClick={handleMovieClick}
        className="absolute inset-0 cursor-pointer"
        aria-label={`View details for ${movie.title}`}
      />

      {/* Rating button - only shows if user can rate */}
      {onOpenRatingModal && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenRatingModal();
          }}
          disabled={isRatingLoading}
          className={`absolute top-2 left-2 p-1.5 rounded-full transition-colors z-10 ${
            isRatingLoading
              ? "bg-gray-400 cursor-not-allowed"
              : userRating
              ? "bg-yellow-500 hover:bg-yellow-600 text-white"
              : "bg-white/80 hover:bg-white text-gray-700 hover:text-yellow-600"
          }`}
          aria-label={userRating ? `Rated ${userRating}/10` : "Rate this movie"}
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

      {/* Want to watch button - only shows if user can toggle */}
      {onToggleWantToWatch && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWantToWatch(movie, isInWantToWatch);
          }}
          disabled={isWantToWatchLoading}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition-colors z-10 ${
            isWantToWatchLoading
              ? "bg-gray-400 cursor-not-allowed"
              : isInWantToWatch
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-white/80 hover:bg-white text-gray-700 hover:text-red-500"
          }`}
          aria-label={
            isInWantToWatch ? "Remove from watchlist" : "Add to watchlist"
          }
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
    </>
  );
};
