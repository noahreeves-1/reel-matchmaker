import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { TMDBMovie } from "@/lib/tmdb";

// DATABASE-BACKED MOVIE ACTIONS HOOK: User interactions with movies
// This hook manages user actions like rating movies and managing watch lists
// Uses database instead of localStorage for persistence
export const useMovieActionsDb = () => {
  const { data: session } = useSession();

  const rateMovie = useCallback(
    async (movie: TMDBMovie, rating: number) => {
      if (!session?.user?.email) {
        console.error("No user session found");
        return;
      }

      try {
        const requestBody = {
          rating,
          movieTitle: movie.title,
          posterPath: movie.poster_path,
          releaseDate: movie.release_date,
        };

        console.log("Sending rating request:", {
          movieId: movie.id,
          rating,
          ratingType: typeof rating,
          requestBody,
        });

        const response = await fetch(`/api/user-ratings/${movie.id}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`Failed to rate movie: ${response.statusText}`);
        }

        // Remove from want-to-watch list if it was there
        // This ensures that once a user rates a movie, it's considered "watched"
        // and should be removed from their want-to-watch list
        try {
          const isInList = await isInWantToWatch(movie.id);
          if (isInList) {
            await removeFromWantToWatch(movie.id);
          }
        } catch (error) {
          // Ignore errors when checking/removing from want-to-watch list
          // The rating was successful, so we don't want to fail the whole operation
          console.log("Note: Could not remove from want-to-watch list:", error);
        }
      } catch (error) {
        console.error("Error rating movie:", error);
        throw error;
      }
    },
    [session?.user?.email]
  );

  const removeRating = useCallback(
    async (movieId: number) => {
      if (!session?.user?.email) {
        console.error("No user session found");
        return;
      }

      try {
        const response = await fetch(`/api/user-ratings/${movieId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`Failed to remove rating: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error removing rating:", error);
        throw error;
      }
    },
    [session?.user?.email]
  );

  const getRating = useCallback(
    async (movieId: number): Promise<number | null> => {
      if (!session?.user?.email) {
        return null;
      }

      try {
        const response = await fetch(`/api/user-ratings/${movieId}`);

        if (!response.ok) {
          if (response.status === 404) {
            return null; // No rating found
          }
          throw new Error(`Failed to get rating: ${response.statusText}`);
        }

        const data = await response.json();
        return data.rating;
      } catch (error) {
        console.error("Error getting rating:", error);
        return null;
      }
    },
    [session?.user?.email]
  );

  const toggleWantToWatch = useCallback(
    async (movie: TMDBMovie) => {
      if (!session?.user?.email) {
        console.error("No user session found");
        return;
      }

      try {
        // First check if the movie is already in the want-to-watch list
        const isInList = await isInWantToWatch(movie.id);

        if (isInList) {
          // Movie is in list, remove it
          const response = await fetch(`/api/want-to-watch/${movie.id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error(
              `Failed to remove from want-to-watch: ${response.statusText}`
            );
          }
        } else {
          // Movie is not in list, add it
          const response = await fetch(`/api/want-to-watch/${movie.id}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              movieTitle: movie.title,
              posterPath: movie.poster_path,
              releaseDate: movie.release_date,
            }),
          });

          if (!response.ok) {
            throw new Error(
              `Failed to add to want-to-watch: ${response.statusText}`
            );
          }
        }
      } catch (error) {
        console.error("Error toggling want-to-watch:", error);
        throw error;
      }
    },
    [session?.user?.email]
  );

  const removeFromWantToWatch = useCallback(
    async (movieId: number) => {
      if (!session?.user?.email) {
        console.error("No user session found");
        return;
      }

      try {
        const response = await fetch(`/api/want-to-watch/${movieId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(
            `Failed to remove from want-to-watch: ${response.statusText}`
          );
        }
      } catch (error) {
        console.error("Error removing from want-to-watch:", error);
        throw error;
      }
    },
    [session?.user?.email]
  );

  const isInWantToWatch = useCallback(
    async (movieId: number): Promise<boolean> => {
      if (!session?.user?.email) {
        return false;
      }

      try {
        const response = await fetch(`/api/want-to-watch/${movieId}`);

        if (!response.ok) {
          if (response.status === 404) {
            return false; // Not in want-to-watch list
          }
          throw new Error(
            `Failed to check want-to-watch: ${response.statusText}`
          );
        }

        return true; // Movie is in want-to-watch list
      } catch (error) {
        console.error("Error checking want-to-watch:", error);
        return false;
      }
    },
    [session?.user?.email]
  );

  return {
    rateMovie,
    removeRating,
    getRating,
    toggleWantToWatch,
    removeFromWantToWatch,
    isInWantToWatch,
  };
};
