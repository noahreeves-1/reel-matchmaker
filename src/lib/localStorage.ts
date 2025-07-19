import { useState } from "react";
import { RatedMovie } from "../types/movie";

// Custom hook for localStorage with TypeScript support
export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

// Storage keys for the app
export const STORAGE_KEYS = {
  RATED_MOVIES: "reel-matchmaker-rated-movies",
  RECOMMENDATIONS: "reel-matchmaker-recommendations",
} as const;

// Utility functions for rated movies
export const getRatedMovies = (): RatedMovie[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.RATED_MOVIES);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading rated movies:", error);
    return [];
  }
};

export const saveRatedMovies = (ratedMovies: RatedMovie[]): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      STORAGE_KEYS.RATED_MOVIES,
      JSON.stringify(ratedMovies)
    );
  } catch (error) {
    console.error("Error saving rated movies:", error);
  }
};

export const removeRating = (movieId: number): void => {
  if (typeof window === "undefined") return;

  try {
    const ratedMovies = getRatedMovies();
    const updatedMovies = ratedMovies.filter((movie) => movie.id !== movieId);
    saveRatedMovies(updatedMovies);
  } catch (error) {
    console.error("Error removing rating:", error);
  }
};
