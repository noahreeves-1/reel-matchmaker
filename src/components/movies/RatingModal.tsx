"use client";

import { useState } from "react";
import Image from "next/image";

type RatingModalMovie = {
  id: number;
  title: string;
  poster_path?: string | null;
  release_date?: string;
  overview?: string;
};

interface RatingModalProps {
  movie: RatingModalMovie;
  isOpen: boolean;
  onClose: () => void;
  onRate: (movie: RatingModalMovie, rating: number) => void;
  onRemoveRating?: (movie: RatingModalMovie) => void;
  currentRating?: number;
}

export const RatingModal = ({
  movie,
  isOpen,
  onClose,
  onRate,
  onRemoveRating,
  currentRating,
}: RatingModalProps) => {
  const [rating, setRating] = useState(currentRating || 0);
  const [hoverRating, setHoverRating] = useState(0);

  if (!isOpen) return null;

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
    // Automatically save and close the modal when a star is clicked
    onRate(movie, starRating);
    onClose();
  };

  const handleRemoveRating = () => {
    if (onRemoveRating) {
      onRemoveRating(movie);
      onClose();
    }
  };

  const handleClose = () => {
    setRating(currentRating || 0);
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-md w-full p-6">
        <div className="flex items-start space-x-4 mb-6">
          {posterUrl ? (
            <div className="relative w-20 h-30">
              <Image
                src={posterUrl}
                alt={movie.title}
                fill
                className="object-cover rounded-lg"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="w-20 h-30 bg-slate-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
              <span className="text-xs text-slate-500">No Poster</span>
            </div>
          )}

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              {movie.title}
            </h3>
            {movie.release_date && (
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                {new Date(movie.release_date).getFullYear()}
              </p>
            )}
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
              {movie.overview}
            </p>
          </div>
        </div>

        <div className="text-center mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Rate this movie from 1 to 10
          </p>

          <div className="flex justify-center space-x-1 mb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <button
                key={star}
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="text-2xl transition-colors duration-200"
              >
                <span
                  className={`
                  ${
                    (hoverRating || rating) >= star
                      ? "text-yellow-400"
                      : "text-slate-300 dark:text-slate-600"
                  }
                `}
                >
                  ★
                </span>
              </button>
            ))}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400">
            {hoverRating > 0
              ? `Rating: ${hoverRating}/10`
              : rating > 0
              ? `You rated this ${rating}/10`
              : "Select a rating"}
          </p>
        </div>

        {/* Remove Rating Button - Only show if there's a current rating and onRemoveRating is provided */}
        {currentRating && onRemoveRating && (
          <div className="text-center mb-4">
            <button
              onClick={handleRemoveRating}
              className="px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            >
              Remove Rating
            </button>
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
