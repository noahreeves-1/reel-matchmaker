import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { TMDBMovie } from "@/lib/tmdb";
import { handleApiError } from "@/lib/errorHandling";

// DATABASE-BACKED MOVIE ACTIONS HOOK: User interactions with movies
// This hook manages user actions like rating movies and managing watch lists
// Uses database instead of localStorage for persistence
export const useMovieActionsDb = () => {
  const { data: session } = useSession();

  const rateMovie = useCallback(
    async (movie: TMDBMovie, rating: number) => {
      if (!session?.user?.email) {
        throw new Error(handleApiError("No user session found"));
      }

      try {
        const requestBody = {
          rating,
          movieTitle: movie.title,
          posterPath: movie.poster_path,
          releaseDate: movie.release_date,
        };

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
          const checkResponse = await fetch(`/api/want-to-watch/${movie.id}`);
          if (checkResponse.ok) {
            await fetch(`/api/want-to-watch/${movie.id}`, {
              method: "DELETE",
            });
          }
        } catch {
          // Ignore errors when checking/removing from want-to-watch list
          // The rating was successful, so we don't want to fail the whole operation
        }
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
    [session?.user?.email]
  );

  const toggleWantToWatch = useCallback(
    async (movie: TMDBMovie) => {
      if (!session?.user?.email) {
        throw new Error(handleApiError("No user session found"));
      }

      try {
        // First check if the movie is already in the want-to-watch list
        const checkResponse = await fetch(`/api/want-to-watch/${movie.id}`);
        const isInList = checkResponse.ok;

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
        throw new Error(handleApiError(error));
      }
    },
    [session?.user?.email]
  );

  return {
    rateMovie,
    toggleWantToWatch,
  };
};
