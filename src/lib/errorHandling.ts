// Handle API errors consistently
// This function normalizes different error types into user-friendly error messages
export const handleApiError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  if (error && typeof error === "object" && "error" in error) {
    const errorObj = error as { error: unknown };
    if (typeof errorObj.error === "string") {
      return errorObj.error;
    }
    if (errorObj.error instanceof Error) {
      return errorObj.error.message;
    }
  }

  if (error && typeof error === "object" && "message" in error) {
    const errorObj = error as { message: unknown };
    if (typeof errorObj.message === "string") {
      return errorObj.message;
    }
  }

  return "An unexpected error occurred";
};
