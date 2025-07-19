import { MovieSearch } from "@/components/movies";

interface HeroProps {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  searchQuery?: string;
}

export const Hero = ({
  onSearch,
  onClear,
  isLoading,
  searchQuery,
}: HeroProps) => (
  <div className="text-center mb-12">
    <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
      Discover Your Next Favorite Movie
    </h2>
    <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
      Like movies you enjoy and get personalized AI recommendations based on
      your taste
    </p>

    {/* Integrated Search Bar */}
    {onSearch && (
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-20"></div>
          <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2">
            <MovieSearch
              onSearch={onSearch}
              onClear={onClear || (() => {})}
              isLoading={isLoading}
              searchQuery={searchQuery}
            />
          </div>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Search by title, genre, or actor to find your perfect movie
        </p>
      </div>
    )}
  </div>
);
