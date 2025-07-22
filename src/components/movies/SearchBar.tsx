import { MovieSearch } from "@/components/movies";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  searchQuery?: string;
}

export const SearchBar = ({
  onSearch,
  onClear,
  isLoading,
  searchQuery,
}: SearchBarProps) => {
  if (!onSearch) return null;

  return (
    <div className="mb-8">
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-30"></div>
          <div className="relative bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-2">
            <MovieSearch
              onSearch={onSearch}
              onClear={onClear || (() => {})}
              isLoading={isLoading}
              searchQuery={searchQuery}
            />
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-white mt-4 text-center">
          Search by title to find your perfect movie.
        </p>
      </div>
    </div>
  );
};
