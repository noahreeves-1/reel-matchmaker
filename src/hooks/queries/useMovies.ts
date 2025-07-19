import { useInfiniteQuery } from "@tanstack/react-query";
import { getPopularMovies, searchMovies } from "@/lib/api";
import { TMDBResponse } from "@/lib/tmdb";
import { useState } from "react";

/**
 * Hook for fetching popular movies with infinite pagination
 */
export const usePopularMovies = (initialData?: TMDBResponse) => {
  return useInfiniteQuery({
    queryKey: ["movies", "popular"],
    queryFn: ({ pageParam }) => getPopularMovies(pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    initialData: initialData
      ? {
          pages: [initialData],
          pageParams: [1],
        }
      : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Hook for searching movies with infinite pagination
 */
export const useMovieSearch = (searchTerm: string) => {
  return useInfiniteQuery({
    queryKey: ["movies", "search", searchTerm],
    queryFn: ({ pageParam }) => searchMovies(searchTerm, pageParam),
    getNextPageParam: (lastPage) =>
      lastPage.page < lastPage.total_pages ? lastPage.page + 1 : undefined,
    initialPageParam: 1,
    enabled: !!searchTerm.trim(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
};

/**
 * Combined hook for movies (popular or search results)
 */
export const useMovies = (initialData?: TMDBResponse) => {
  const [searchQuery, setSearchQuery] = useState("");

  const popularMoviesQuery = usePopularMovies(initialData);
  const searchMoviesQuery = useMovieSearch(searchQuery);

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
