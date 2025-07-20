// APPLICATION CONSTANTS: Centralized configuration and constants
// This file contains all application-wide constants and configuration values

export const API_CONFIG = {
  TMDB_BASE_URL: "https://api.themoviedb.org/3",
  TMDB_IMAGE_BASE_URL: "https://image.tmdb.org/t/p",
  DEFAULT_LANGUAGE: "en-US",
  DEFAULT_REGION: "US",
} as const;

export const APP_CONFIG = {
  NAME: "Reel Matchmaker",
  DESCRIPTION: "AI-powered movie recommendations",
  VERSION: "1.0.0",
} as const;

export const UI_CONFIG = {
  ITEMS_PER_PAGE: 20,
  MAX_RATING: 5,
  MIN_RATING: 1,
} as const;

export const CACHE_CONFIG = {
  MOVIES_STALE_TIME: 1000 * 60 * 5, // 5 minutes
  MOVIES_GC_TIME: 1000 * 60 * 30, // 30 minutes
  RECOMMENDATIONS_STALE_TIME: 1000 * 60 * 60, // 1 hour
} as const;
