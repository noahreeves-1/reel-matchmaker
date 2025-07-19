import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getPopularMovies, searchMovies } from "@/lib/api";
import { TMDBMovie, TMDBResponse } from "@/lib/tmdb";

export const useMovies = (initialMovies?: TMDBResponse) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Query for popular movies
  const popularMoviesQuery = useInfiniteQuery({
    queryKey: ["popular-movies"],
    queryFn: ({ pageParam }) => getPopularMovies(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    initialData: initialMovies
      ? {
          pages: [initialMovies],
          pageParams: [1],
        }
      : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Query for search results
  const searchMoviesQuery = useInfiniteQuery({
    queryKey: ["search-movies", searchQuery],
    queryFn: ({ pageParam }) => searchMovies(searchQuery, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!searchQuery.trim(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Determine which query to use
  const activeQuery = searchQuery.trim()
    ? searchMoviesQuery
    : popularMoviesQuery;

  const performSearch = (query: string) => {
    setSearchQuery(query);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  // Flatten all pages into a single array
  const movies = activeQuery.data?.pages.flatMap((page) => page.results) || [];

  return {
    movies,
    isLoadingMovies: activeQuery.isLoading,
    movieError: activeQuery.error?.message || null,
    hasMoreMovies: !!activeQuery.hasNextPage,
    isLoadingMore: activeQuery.isFetchingNextPage,
    loadMoreMovies: () => activeQuery.fetchNextPage(),
    refetch: () => activeQuery.refetch(),
    searchQuery,
    isSearching: searchMoviesQuery.isLoading,
    performSearch,
    clearSearch,
  };
};
