import { useState } from "react";

// Simple state management for rating modal
// This hook manages the open/close state and rating value for the movie rating modal
export const useRatingModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [movieId, setMovieId] = useState<number | null>(null);

  const openModal = (id: number) => {
    setMovieId(id);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setRating(null);
    setMovieId(null);
  };

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  return {
    isOpen,
    rating,
    movieId,
    openModal,
    closeModal,
    handleRatingChange,
  };
};
