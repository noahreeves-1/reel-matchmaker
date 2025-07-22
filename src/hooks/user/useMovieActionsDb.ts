import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TMDBMovie } from "@/lib/tmdb";
import { handleApiError } from "@/lib/errorHandling";
import { RatedMovie } from "@/types/movie";

// DATABASE-BACKED MOVIE ACTIONS HOOK: User interactions with movies
// This hook manages user actions like rating movies and managing watch lists
// Uses database instead of localStorage for persistence
// Now includes optimistic updates for instant UI feedback
export const useMovieActionsDb = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // OPTIMISTIC RATING MUTATION: Instant UI updates with background sync
  // This mutation provides immediate feedback while the API call happens in the background
  // If the API fails, the UI automatically rolls back to the previous state
  const rateMovieMutation = useMutation({
    mutationFn: async ({
      movie,
      rating,
    }: {
      movie: TMDBMovie;
      rating: number;
    }) => {
      if (!session?.user?.email) {
        throw new Error(handleApiError("No user session found"));
      }

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

      return { movie, rating };
    },
    // OPTIMISTIC UPDATE: Immediately update the UI before the API call completes
    onMutate: async ({ movie, rating }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["ratedMovies"] });

      // Snapshot the previous value for potential rollback
      const previousRatedMovies = queryClient.getQueryData<RatedMovie[]>([
        "ratedMovies",
      ]);

      // Optimistically update the rated movies cache
      queryClient.setQueryData<RatedMovie[]>(["ratedMovies"], (old) => {
        if (!old) return old;

        const existingIndex = old.findIndex((rm) => rm.id === movie.id);
        const newRatedMovie: RatedMovie = {
          id: movie.id,
          title: movie.title,
          rating,
          ratedAt: new Date().toISOString(),
        };

        if (existingIndex >= 0) {
          // Update existing rating
          const updated = [...old];
          updated[existingIndex] = newRatedMovie;
          return updated;
        } else {
          // Add new rating
          return [...old, newRatedMovie];
        }
      });

      // Also optimistically remove from want-to-watch list
      queryClient.setQueryData<{ id: number }[]>(["wantToWatch"], (old) => {
        if (!old) return old;
        return old.filter((item) => item.id !== movie.id);
      });

      // Return context with the snapshotted value for rollback
      return { previousRatedMovies };
    },
    // ROLLBACK: If the mutation fails, roll back to the previous state
    onError: (err, variables, context) => {
      console.error("Rating mutation failed:", err);

      // Rollback rated movies to previous state
      if (context?.previousRatedMovies) {
        queryClient.setQueryData(["ratedMovies"], context.previousRatedMovies);
      }
    },
    // SUCCESS: Always refetch after mutation to ensure data consistency
    onSettled: () => {
      // Refetch rated movies to ensure we have the latest data
      queryClient.invalidateQueries({ queryKey: ["ratedMovies"] });
      // Refetch want-to-watch list to ensure consistency
      queryClient.invalidateQueries({ queryKey: ["wantToWatch"] });
    },
  });

  const rateMovie = useCallback(
    async (movie: TMDBMovie, rating: number) => {
      return rateMovieMutation.mutateAsync({ movie, rating });
    },
    [rateMovieMutation]
  );

  // OPTIMISTIC RATING REMOVAL MUTATION: Instant UI updates for rating removal
  // This mutation provides immediate feedback while the API call happens in the background
  // If the API fails, the UI automatically rolls back to the previous state
  const removeRatingMutation = useMutation({
    mutationFn: async ({ movieId }: { movieId: number }) => {
      if (!session?.user?.email) {
        throw new Error(handleApiError("No user session found"));
      }

      const response = await fetch(`/api/user-ratings/${movieId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to remove rating: ${response.statusText}`);
      }

      return { movieId };
    },
    // OPTIMISTIC UPDATE: Immediately update the UI before the API call completes
    onMutate: async ({ movieId }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["ratedMovies"] });

      // Snapshot the previous value for potential rollback
      const previousRatedMovies = queryClient.getQueryData<RatedMovie[]>([
        "ratedMovies",
      ]);

      // Optimistically remove the movie from the rated movies cache
      queryClient.setQueryData<RatedMovie[]>(["ratedMovies"], (old) => {
        if (!old) return old;
        return old.filter((movie) => movie.id !== movieId);
      });

      // Return context with the snapshotted value for rollback
      return { previousRatedMovies };
    },
    // SUCCESS: Update cache with server response instead of invalidating
    onSuccess: (data, variables) => {
      console.log("Rating removal mutation success:", { data, variables });

      // Update the cache directly with the new state
      queryClient.setQueryData<RatedMovie[]>(["ratedMovies"], (old) => {
        if (!old) return old;
        // Ensure the movie is removed from the list
        return old.filter((movie) => movie.id !== variables.movieId);
      });
    },
    // ROLLBACK: If the mutation fails, roll back to the previous state
    onError: (err, variables, context) => {
      console.error("Rating removal mutation failed:", err);

      // Rollback rated movies to previous state
      if (context?.previousRatedMovies) {
        queryClient.setQueryData(["ratedMovies"], context.previousRatedMovies);
      }
    },
  });

  const removeRating = useCallback(
    async (movieId: number, onSuccess?: () => void) => {
      const result = await removeRatingMutation.mutateAsync({ movieId });
      if (onSuccess) {
        onSuccess();
      }
      return result;
    },
    [removeRatingMutation]
  );

  // OPTIMISTIC WANT TO WATCH MUTATION: Instant UI updates for watch list management
  // This mutation provides immediate feedback while the API call happens in the background
  // If the API fails, the UI automatically rolls back to the previous state
  const toggleWantToWatchMutation = useMutation({
    mutationFn: async ({
      movie,
      isCurrentlyInList,
    }: {
      movie: TMDBMovie;
      isCurrentlyInList: boolean;
    }) => {
      if (!session?.user?.email) {
        throw new Error(handleApiError("No user session found"));
      }

      if (isCurrentlyInList) {
        // Movie is in list, remove it
        const response = await fetch(`/api/want-to-watch/${movie.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(
            `Failed to remove from want-to-watch: ${response.statusText}`
          );
        }
        return { movie, action: "removed" as const };
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
        return { movie, action: "added" as const };
      }
    },
    // OPTIMISTIC UPDATE: Immediately update the UI before the API call completes
    onMutate: async ({ movie, isCurrentlyInList }) => {
      // Cancel any outgoing refetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ["wantToWatch"] });

      // Snapshot the previous value for potential rollback
      const previousWantToWatch = queryClient.getQueryData<{ id: number }[]>([
        "wantToWatch",
      ]);

      // Optimistically update the want-to-watch cache based on current UI state
      queryClient.setQueryData<{ id: number }[]>(["wantToWatch"], (old) => {
        if (!old) return old;

        if (isCurrentlyInList) {
          // Remove from list
          return old.filter((item) => item.id !== movie.id);
        } else {
          // Add to list
          return [...old, { id: movie.id }];
        }
      });

      // Return context with the snapshotted value and action for rollback
      return {
        previousWantToWatch,
        action: isCurrentlyInList ? "removed" : "added",
      };
    },
    // SUCCESS: Update cache with server response instead of invalidating
    onSuccess: (data, variables) => {
      console.log("Want to watch mutation success:", { data, variables });

      // Update the cache directly with the new state
      queryClient.setQueryData<{ id: number }[]>(["wantToWatch"], (old) => {
        if (!old) return old;

        if (variables.isCurrentlyInList) {
          // Movie was removed, ensure it's not in the list
          return old.filter((item) => item.id !== variables.movie.id);
        } else {
          // Movie was added, ensure it's in the list
          const exists = old.some((item) => item.id === variables.movie.id);
          if (!exists) {
            return [...old, { id: variables.movie.id }];
          }
          return old;
        }
      });
    },
    // ROLLBACK: If the mutation fails, roll back to the previous state
    onError: (err, variables, context) => {
      console.error("Want to watch mutation failed:", err);

      // Rollback want-to-watch list to previous state
      if (context?.previousWantToWatch) {
        queryClient.setQueryData(["wantToWatch"], context.previousWantToWatch);
      }
    },
  });

  const toggleWantToWatch = useCallback(
    async (movie: TMDBMovie, isCurrentlyInList?: boolean) => {
      // If isCurrentlyInList is not provided, check the current cache
      if (isCurrentlyInList === undefined) {
        const currentWantToWatch =
          queryClient.getQueryData<{ id: number }[]>(["wantToWatch"]) || [];
        isCurrentlyInList = currentWantToWatch.some(
          (item) => item.id === movie.id
        );
      }

      return toggleWantToWatchMutation.mutateAsync({
        movie,
        isCurrentlyInList,
      });
    },
    [toggleWantToWatchMutation, queryClient]
  );

  return {
    rateMovie,
    removeRating,
    toggleWantToWatch,
    // Expose mutation states for loading indicators
    isRatingMovie: rateMovieMutation.isPending,
    isRemovingRating: removeRatingMutation.isPending,
    isTogglingWantToWatch: toggleWantToWatchMutation.isPending,
    ratingError: rateMovieMutation.error,
    removeRatingError: removeRatingMutation.error,
    wantToWatchError: toggleWantToWatchMutation.error,
  };
};
