// ERROR HANDLING UTILITIES: Common error handling functions
// This file provides utility functions for consistent error handling across the application

/**
 * Handle API errors consistently
 * This function normalizes different error types into user-friendly error messages
 */
export const handleApiError = (error: unknown): string => {
  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle objects with error properties
  if (error && typeof error === "object" && "error" in error) {
    const errorObj = error as { error: unknown };
    if (typeof errorObj.error === "string") {
      return errorObj.error;
    }
    if (errorObj.error instanceof Error) {
      return errorObj.error.message;
    }
  }

  // Handle objects with message properties
  if (error && typeof error === "object" && "message" in error) {
    const errorObj = error as { message: unknown };
    if (typeof errorObj.message === "string") {
      return errorObj.message;
    }
  }

  // Fallback for unknown error types
  return "An unexpected error occurred";
};
