import { RatedMovie, MovieRecommendation } from "@/types/movie";
import { RecommendationsSectionClient } from "./RecommendationsSectionClient";

// SERVER COMPONENT: Static recommendations section content
// This component handles all server-side rendering (SEO, static content)
// No "use client" directive - runs on server
interface RecommendationsSectionProps {
  ratedMoviesCount: number;
  ratedMovies: RatedMovie[];
  wantToWatchCount?: number;
  wantToWatchList?: { id: number }[];
  onGenerateRecommendations: () => void;
  onRateMovie: (movieId: number, rating: number) => void;
  isLoading?: boolean;
  isLoadingLastRecommendations?: boolean;
  recommendations?: MovieRecommendation[];
  ratingLoadingStates?: Record<number, boolean>;
  wantToWatchLoadingStates?: Record<number, boolean>;
  onToggleWantToWatch?: (
    movie: MovieRecommendation,
    isInWantToWatch: boolean
  ) => void;
}

export const RecommendationsSection = ({
  ratedMoviesCount,
  ratedMovies,
  wantToWatchCount = 0,
  wantToWatchList = [],
  onGenerateRecommendations,
  onRateMovie,
  isLoading = false,
  isLoadingLastRecommendations = false,
  recommendations = [],
  ratingLoadingStates = {},
  wantToWatchLoadingStates = {},
  onToggleWantToWatch,
}: RecommendationsSectionProps) => {
  const hasRecommendations = recommendations.length > 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-12 max-w-5xl mx-auto">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              AI Recommendations
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Based on your{" "}
              <span className="font-bold text-white">
                {ratedMoviesCount} Rated
              </span>
              {wantToWatchCount > 0 && (
                <>
                  {" "}
                  movies, and{" "}
                  <span className="font-bold text-white">
                    {wantToWatchCount} Want to Watch
                  </span>{" "}
                  movies
                </>
              )}
            </p>
          </div>

          <button
            onClick={onGenerateRecommendations}
            disabled={isLoading || ratedMoviesCount === 0}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {hasRecommendations
              ? "Generate New Recommendations"
              : "Generate Recommendations"}
          </button>
        </div>

        {/* Client component handles all interactive content and state */}
        <RecommendationsSectionClient
          ratedMoviesCount={ratedMoviesCount}
          ratedMovies={ratedMovies}
          wantToWatchList={wantToWatchList}
          onRateMovie={onRateMovie}
          isLoading={isLoading}
          isLoadingLastRecommendations={isLoadingLastRecommendations}
          recommendations={recommendations}
          ratingLoadingStates={ratingLoadingStates}
          wantToWatchLoadingStates={wantToWatchLoadingStates}
          onToggleWantToWatch={onToggleWantToWatch}
        />
      </div>
    </div>
  );
};
