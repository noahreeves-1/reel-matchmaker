// ERROR HANDLING UTILITIES: Common error handling functions
// This file provides utility functions for consistent error handling across the application

/**
 * Safely parse JSON with error handling
 */
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    console.warn("Failed to parse JSON:", error);
    return fallback;
  }
};

/**
 * Handle API errors consistently
 */
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return "An unexpected error occurred";
};
