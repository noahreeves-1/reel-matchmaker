import Image from "next/image";
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
  <div className="relative text-center py-24 lg:py-32 overflow-hidden">
    {/* Background Image */}
    <div className="absolute inset-0">
      <Image
        src="/movie-background-collage.jpg"
        alt="Movie background"
        fill
        className="object-cover"
        priority
      />
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-slate-900/60 dark:bg-slate-900/70"></div>
    </div>

    {/* Content */}
    <div className="relative z-10">
      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
        Discover Your Next Favorite Movie
      </h2>
      <p className="text-xl text-slate-200 max-w-4xl mx-auto mb-10">
        Rate movies you enjoy and get personalized AI recommendations based on
        your taste.
      </p>

      {/* Integrated Search Bar */}
      {onSearch && (
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
          <p className="text-sm text-slate-300 mt-4">
            Search by title, genre, or actor to find your perfect movie
          </p>
        </div>
      )}
    </div>
  </div>
);
