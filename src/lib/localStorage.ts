import { useState } from "react";
import { RatedMovie, WantToWatchMovie } from "../types/movie";

// LOCAL STORAGE MANAGEMENT: Client-side data persistence
// This file provides a complete localStorage solution for user data
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: No server persistence, no cross-device sync, limited storage (5-10MB)
// - VERCEL OPTIMIZATIONS: Static hosting, no server costs, instant access
// - SCALE BREAKERS: localStorage size limits, data loss on browser clear, no backup
// - FUTURE IMPROVEMENTS: Migrate to PostgreSQL + NextAuth.js for server-side persistence
//
// CURRENT USAGE: User ratings, want-to-watch list, recommendations
// FUTURE MIGRATION: These functions will be replaced with database operations

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
  WANT_TO_WATCH: "reel-matchmaker-want-to-watch",
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

// Utility functions for want to watch list
export const getWantToWatchList = (): WantToWatchMovie[] => {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.WANT_TO_WATCH);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Error reading want to watch list:", error);
    return [];
  }
};

export const saveWantToWatchList = (
  wantToWatchList: WantToWatchMovie[]
): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(
      STORAGE_KEYS.WANT_TO_WATCH,
      JSON.stringify(wantToWatchList)
    );
  } catch (error) {
    console.error("Error saving want to watch list:", error);
  }
};

export const addToWantToWatchList = (movie: WantToWatchMovie): void => {
  if (typeof window === "undefined") return;

  try {
    const wantToWatchList = getWantToWatchList();
    const existingIndex = wantToWatchList.findIndex(
      (item) => item.id === movie.id
    );

    if (existingIndex === -1) {
      wantToWatchList.push(movie);
      saveWantToWatchList(wantToWatchList);
    }
  } catch (error) {
    console.error("Error adding to want to watch list:", error);
  }
};

export const removeFromWantToWatchList = (movieId: number): void => {
  if (typeof window === "undefined") return;

  try {
    const wantToWatchList = getWantToWatchList();
    const updatedWantToWatchList = wantToWatchList.filter(
      (movie) => movie.id !== movieId
    );
    saveWantToWatchList(updatedWantToWatchList);
  } catch (error) {
    console.error("Error removing from want to watch list:", error);
  }
};

export const isInWantToWatchList = (movieId: number): boolean => {
  if (typeof window === "undefined") return false;

  try {
    const wantToWatchList = getWantToWatchList();
    return wantToWatchList.some((movie) => movie.id === movieId);
  } catch (error) {
    console.error("Error checking want to watch list:", error);
    return false;
  }
};
