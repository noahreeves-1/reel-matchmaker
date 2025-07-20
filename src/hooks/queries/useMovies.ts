import { useInfiniteQuery } from "@tanstack/react-query";
import { getPopularMovies, searchMovies } from "@/lib/api";
import { TMDBResponse } from "@/lib/tmdb";
import { CACHE_CONFIG } from "@/lib/constants";
import { useState } from "react";

// MOVIE QUERY HOOKS: React Query integration for movie data fetching
// This file provides hooks for fetching popular movies and search results with caching
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Client-side caching vs. memory usage, stale data vs. fresh data
// - VERCEL OPTIMIZATIONS: React Query caching, background refetching, optimistic updates
// - SCALE BREAKERS: Large cache sizes, memory leaks, stale cache invalidation
// - FUTURE IMPROVEMENTS: Add server-side caching, cache persistence, prefetching
//
// CURRENT USAGE: Movie data fetching, search functionality, infinite pagination
// PERFORMANCE: Intelligent caching, background updates, memory management

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
    staleTime: CACHE_CONFIG.MOVIES_STALE_TIME,
    gcTime: CACHE_CONFIG.MOVIES_GC_TIME,
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
    staleTime: CACHE_CONFIG.MOVIES_STALE_TIME,
    gcTime: CACHE_CONFIG.MOVIES_GC_TIME,
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
