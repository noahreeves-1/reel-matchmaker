"use client";

import { useState } from "react";
import { TMDBMovie } from "@/lib/tmdb";

interface RatingModalProps {
  movie: TMDBMovie;
  isOpen: boolean;
  onClose: () => void;
  onRate: (movieId: number, rating: number) => void;
  currentRating?: number;
}

export const RatingModal = ({
  movie,
  isOpen,
  onClose,
  onRate,
  currentRating,
}: RatingModalProps) => {
  const [rating, setRating] = useState(currentRating || 0);
  const [hoverRating, setHoverRating] = useState(0);

  if (!isOpen) return null;

  const handleRate = () => {
    if (rating > 0) {
      onRate(movie.id, rating);
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
            <img
              src={posterUrl}
              alt={movie.title}
              className="w-20 h-30 object-cover rounded-lg"
            />
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
                onClick={() => setRating(star)}
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
            {rating > 0 ? `You rated this ${rating}/10` : "Select a rating"}
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleRate}
            disabled={rating === 0}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentRating ? "Update Rating" : "Rate Movie"}
          </button>
        </div>
      </div>
    </div>
  );
};
