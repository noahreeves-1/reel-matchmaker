"use client";

import { MovieSearch } from "./MovieSearch";

interface MovieSearchStandaloneProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isLoading?: boolean;
  searchQuery?: string;
}

export const MovieSearchStandalone = ({
  onSearch,
  onClear,
  isLoading,
  searchQuery,
}: MovieSearchStandaloneProps) => {
  return (
    <div className="relative max-w-lg mx-auto mb-8">
      <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
        <MovieSearch
          onSearch={onSearch}
          onClear={onClear}
          isLoading={isLoading}
          searchQuery={searchQuery}
        />
      </div>
    </div>
  );
};
