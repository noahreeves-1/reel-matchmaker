import { useQuery } from "@tanstack/react-query";
import { getMovieDetails } from "@/lib/api";
import { TMDBMovie } from "@/lib/tmdb";

export const useMovieDetails = (movieId: number | null) => {
  return useQuery({
    queryKey: ["movie", movieId],
    queryFn: () => getMovieDetails(movieId!),
    enabled: !!movieId,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

export const useMovieDetailsBatch = (movieIds: number[]) => {
  return useQuery({
    queryKey: ["movies", movieIds],
    queryFn: async () => {
      const moviePromises = movieIds.map((id) => getMovieDetails(id));
      const movies = await Promise.all(moviePromises);

      // Return as a map for easy lookup
      const movieMap: Record<number, TMDBMovie> = {};
      movieIds.forEach((id, index) => {
        movieMap[id] = movies[index];
      });

      return movieMap;
    },
    enabled: movieIds.length > 0,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};
