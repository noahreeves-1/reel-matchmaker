import { useState } from "react";
import { TMDBMovie } from "../lib";

export const useRatingModal = () => {
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    movie: TMDBMovie | null;
  }>({
    isOpen: false,
    movie: null,
  });

  const openRatingModal = (movie: TMDBMovie) => {
    setRatingModal({
      isOpen: true,
      movie,
    });
  };

  const closeRatingModal = () => {
    setRatingModal({
      isOpen: false,
      movie: null,
    });
  };

  return {
    ratingModal,
    openRatingModal,
    closeRatingModal,
  };
};
