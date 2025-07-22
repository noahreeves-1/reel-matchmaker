import { useCallback } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TMDBMovie } from "@/lib/tmdb";
import { handleApiError } from "@/lib/errorHandling";
import { RatedMovie } from "@/types/movie";

// Database-backed movie actions with optimistic updates
// Manages user actions like rating movies and managing watch lists
export const useMovieActionsDb = () => {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  // Optimistic rating mutation with instant UI updates and background sync
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
      try {
        const checkResponse = await fetch(`/api/want-to-watch/${movie.id}`);
        if (checkResponse.ok) {
          await fetch(`/api/want-to-watch/${movie.id}`, {
            method: "DELETE",
          });
        }
      } catch {
        // Ignore errors when checking/removing from want-to-watch list
      }

      return { movie, rating };
    },
    onMutate: async ({ movie, rating }) => {
      await queryClient.cancelQueries({ queryKey: ["ratedMovies"] });

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
          const updated = [...old];
          updated[existingIndex] = newRatedMovie;
          return updated;
        } else {
          return [...old, newRatedMovie];
        }
      });

      // Also optimistically remove from want-to-watch list
      queryClient.setQueryData<{ id: number }[]>(["wantToWatch"], (old) => {
        if (!old) return old;
        return old.filter((item) => item.id !== movie.id);
      });

      return { previousRatedMovies };
    },
    onError: (err, variables, context) => {
      console.error("Rating mutation failed:", err);

      if (context?.previousRatedMovies) {
        queryClient.setQueryData(["ratedMovies"], context.previousRatedMovies);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["ratedMovies"] });
      queryClient.invalidateQueries({ queryKey: ["wantToWatch"] });
    },
  });

  const rateMovie = useCallback(
    async (movie: TMDBMovie, rating: number) => {
      return rateMovieMutation.mutateAsync({ movie, rating });
    },
    [rateMovieMutation]
  );

  // Optimistic rating removal mutation with instant UI updates
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
    onMutate: async ({ movieId }) => {
      await queryClient.cancelQueries({ queryKey: ["ratedMovies"] });

      const previousRatedMovies = queryClient.getQueryData<RatedMovie[]>([
        "ratedMovies",
      ]);

      // Optimistically remove the movie from the rated movies cache
      queryClient.setQueryData<RatedMovie[]>(["ratedMovies"], (old) => {
        if (!old) return old;
        return old.filter((movie) => movie.id !== movieId);
      });

      return { previousRatedMovies };
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData<RatedMovie[]>(["ratedMovies"], (old) => {
        if (!old) return old;
        return old.filter((movie) => movie.id !== variables.movieId);
      });
    },
    onError: (err, variables, context) => {
      console.error("Rating removal mutation failed:", err);

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

  // Optimistic want-to-watch mutation with instant UI updates
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
    onMutate: async ({ movie, isCurrentlyInList }) => {
      await queryClient.cancelQueries({ queryKey: ["wantToWatch"] });

      const previousWantToWatch = queryClient.getQueryData<{ id: number }[]>([
        "wantToWatch",
      ]);

      // Optimistically update the want-to-watch cache based on current UI state
      queryClient.setQueryData<{ id: number }[]>(["wantToWatch"], (old) => {
        if (!old) return old;

        if (isCurrentlyInList) {
          return old.filter((item) => item.id !== movie.id);
        } else {
          return [...old, { id: movie.id }];
        }
      });

      return {
        previousWantToWatch,
        action: isCurrentlyInList ? "removed" : "added",
      };
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData<{ id: number }[]>(["wantToWatch"], (old) => {
        if (!old) return old;

        if (variables.isCurrentlyInList) {
          return old.filter((item) => item.id !== variables.movie.id);
        } else {
          const exists = old.some((item) => item.id === variables.movie.id);
          if (!exists) {
            return [...old, { id: variables.movie.id }];
          }
          return old;
        }
      });
    },
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
