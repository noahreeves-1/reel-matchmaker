import { useInfiniteQuery } from "@tanstack/react-query";
import { getPopularMovies, searchMovies } from "@/lib/api";
import { TMDBResponse } from "@/lib/tmdb";
import { CACHE_CONFIG } from "@/lib/constants";
import { useState, useCallback } from "react";

// React Query hooks for movie data fetching with intelligent caching
//
// DUAL-CACHING: Next.js ISR (server) + React Query (client) with 5-min stale time
// INFINITE PAGINATION: Efficient pagination with React Query's infinite queries
// BACKGROUND REFETCH: Automatic refetch on window focus for data freshness

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

export const useMovies = (initialData?: TMDBResponse) => {
  const [searchQuery, setSearchQuery] = useState("");

  const popularMoviesQuery = usePopularMovies(initialData);
  const searchMoviesQuery = useMovieSearch(searchQuery);

  const activeQuery = searchQuery.trim()
    ? searchMoviesQuery
    : popularMoviesQuery;

  const performSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const movies = activeQuery.data?.pages.flatMap((page) => page.results) || [];

  const isLoadingMovies = searchQuery.trim()
    ? activeQuery.isLoading
    : activeQuery.isLoading && !initialData;

  return {
    movies,
    isLoadingMovies,
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
