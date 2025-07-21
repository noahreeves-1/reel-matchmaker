"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { RatedMovie, MovieRecommendation } from "@/types/movie";
import { RatingModal } from "./RatingModal";
import { LoadingAnimation } from "@/components/common";

// AI RECOMMENDATION LOADING STEPS: Custom steps for AI recommendation generation
// More steps to cover the full 30-second duration and prevent cycling too fast
const AI_RECOMMENDATION_STEPS = [
  "Analyzing your movie ratings...",
  "Understanding your taste preferences...",
  "Exploring your watchlist patterns...",
  "Finding similar movies you might love...",
  "Searching through thousands of films...",
  "Identifying hidden gems for you...",
  "Generating personalized recommendations...",
  "Adding detailed explanations...",
  "Calculating match scores...",
  "Gathering movie details...",
  "Finalizing your recommendations...",
  "Almost ready with your matches...",
  "Preparing your personalized list...",
  "Just a few more seconds...",
];

interface RecommendationsSectionProps {
  ratedMoviesCount: number;
  ratedMovies: RatedMovie[];
  wantToWatchCount?: number;
  onGenerateRecommendations: () => void;
  onRateMovie: (movieId: number, rating: number) => void;
  isLoading?: boolean;
  recommendations?: MovieRecommendation[];
}

export const RecommendationsSection = ({
  ratedMoviesCount,
  ratedMovies,
  wantToWatchCount = 0,
  onGenerateRecommendations,
  onRateMovie,
  isLoading = false,
  recommendations = [],
}: RecommendationsSectionProps) => {
  const [ratingModal, setRatingModal] = useState<{
    isOpen: boolean;
    movie: MovieRecommendation | null;
  }>({
    isOpen: false,
    movie: null,
  });

  // Add client-side only state to prevent hydration mismatches
  const [isClient, setIsClient] = useState(false);

  const hasRecommendations = recommendations.length > 0;

  // Set client flag after hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleRateMovie = (
    movie: {
      id: number;
      title: string;
      poster_path?: string | null;
      release_date?: string;
      overview?: string;
    },
    rating: number
  ) => {
    onRateMovie(movie.id, rating);
  };

  const handleOpenRatingModal = (movie: MovieRecommendation) => {
    setRatingModal({
      isOpen: true,
      movie,
    });
  };

  const closeRatingModal = () => {
    setRatingModal({
      isOpen: false,
      movie: null,
    });
  };

  const handleToggleWantToWatch = (
    _movie: MovieRecommendation,
    _isInWantToWatch: boolean
  ) => {
    // This would typically call a function to toggle want to watch
    // For now, we'll just log the action
    // console.log(
    //   `${isInWantToWatch ? "Removing" : "Adding"} ${
    //     movie.title
    //   } to want to watch list`
    // );
  };

  const getMatchLevelDisplay = (level?: string) => {
    switch (level) {
      case "LOVE IT":
        return {
          emoji: "❤️",
          color: "text-red-600 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-900/20",
        };
      case "LIKE IT":
        return {
          emoji: "👍",
          color: "text-green-600 dark:text-green-400",
          bgColor: "bg-green-50 dark:bg-green-900/20",
        };
      case "MAYBE":
        return {
          emoji: "🤔",
          color: "text-yellow-600 dark:text-yellow-400",
          bgColor: "bg-yellow-50 dark:bg-yellow-900/20",
        };
      case "RISKY":
        return {
          emoji: "⚠️",
          color: "text-orange-600 dark:text-orange-400",
          bgColor: "bg-orange-50 dark:bg-orange-900/20",
        };
      default:
        return {
          emoji: "🎬",
          color: "text-slate-600 dark:text-slate-400",
          bgColor: "bg-slate-50 dark:bg-slate-700",
        };
    }
  };

  const formatVoteCount = (count?: number) => {
    if (!count) return null;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
    return count.toString();
  };

  const formatRevenue = (revenue?: number) => {
    if (!revenue) return null;
    if (revenue >= 1000000000) return `$${(revenue / 1000000000).toFixed(1)}B`;
    if (revenue >= 1000000) return `$${(revenue / 1000000).toFixed(0)}M`;
    return `$${(revenue / 1000).toFixed(0)}K`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              AI Recommendations
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              {isClient ? (
                <>
                  Based on your {ratedMoviesCount} rated movies
                  {wantToWatchCount > 0 &&
                    ` and ${wantToWatchCount} want-to-watch items`}
                </>
              ) : (
                "Loading your movie data..."
              )}
            </p>
          </div>

          <button
            onClick={onGenerateRecommendations}
            disabled={isLoading || (isClient && ratedMoviesCount === 0)}
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

        {isLoading && (
          <LoadingAnimation
            steps={AI_RECOMMENDATION_STEPS}
            variant="purple"
            timeEstimate="This usually takes 25-35 seconds"
            estimatedDuration={30000} // 30 seconds in milliseconds
            preventReset={true} // Prevent progress bar from resetting
            showIcon={false} // Hide icon for AI recommendations
          />
        )}

        {!isLoading && !hasRecommendations && ratedMoviesCount === 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg p-8 border border-amber-200 dark:border-amber-700 text-center">
            <div className="text-amber-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-2">
              Rate Some Movies First
            </h3>
            <p className="text-amber-700 dark:text-amber-300 mb-4">
              To get personalized AI recommendations, you need to rate at least
              3 movies first. Scroll down to rate some movies you've watched.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-amber-600 dark:text-amber-400">
              <span>⭐</span>
              <span>Rate movies you've watched</span>
              <span>•</span>
              <span>🎯</span>
              <span>Help AI understand your taste</span>
              <span>•</span>
              <span>🤖</span>
              <span>Get personalized recommendations</span>
            </div>
          </div>
        )}

        {!isLoading && !hasRecommendations && ratedMoviesCount > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-8 border border-blue-200 dark:border-blue-700 text-center">
            <div className="text-blue-500 mb-4">
              <svg
                className="w-16 h-16 mx-auto"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Ready for AI Recommendations!
            </h3>
            <p className="text-blue-700 dark:text-blue-300 mb-4">
              You've rated {ratedMoviesCount} movies. Click the button above to
              get personalized AI recommendations based on your taste.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 dark:text-blue-400">
              <span>🤖</span>
              <span>AI will analyze your preferences</span>
              <span>•</span>
              <span>🎯</span>
              <span>Find movies you'll love</span>
              <span>•</span>
              <span>⚡</span>
              <span>Takes about 10-15 seconds</span>
            </div>
          </div>
        )}

        {!isLoading && hasRecommendations && (
          <div>
            <div className="space-y-6">
              {recommendations.map((rec, index) => {
                const userRating = ratedMovies.find(
                  (rm) => rm.id === rec.id
                )?.rating;
                const isInWantToWatch = false; // This would come from props
                const posterUrl = rec.poster_path
                  ? `https://image.tmdb.org/t/p/w200${rec.poster_path}`
                  : null;

                const matchDisplay = getMatchLevelDisplay(rec.matchLevel);
                const voteCountFormatted = formatVoteCount(rec.vote_count);
                const revenueFormatted = formatRevenue(rec.revenue);

                return (
                  <div
                    key={index}
                    className="bg-slate-50 dark:bg-slate-700 rounded-lg p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex gap-6">
                      {/* Movie Poster */}
                      <div className="flex-shrink-0">
                        {posterUrl ? (
                          <div className="relative w-20 h-30">
                            <Image
                              src={posterUrl}
                              alt={rec.title}
                              fill
                              className="object-cover rounded-lg shadow-sm"
                              sizes="80px"
                            />
                          </div>
                        ) : (
                          <div className="w-20 h-30 bg-slate-200 dark:bg-slate-600 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              No Poster
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Movie Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-slate-900 dark:text-white text-lg leading-tight mb-1">
                              {rec.title}
                            </h4>

                            {/* Release Year and TMDB Rating */}
                            <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-3">
                              {rec.release_date && (
                                <span>
                                  {new Date(rec.release_date).getFullYear()}
                                </span>
                              )}
                              {rec.vote_average && (
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow-500">⭐</span>
                                  <span>{rec.vote_average.toFixed(1)}/10</span>
                                  {voteCountFormatted && (
                                    <span>({voteCountFormatted})</span>
                                  )}
                                </div>
                              )}
                              {revenueFormatted && (
                                <span className="text-green-600 dark:text-green-400">
                                  {revenueFormatted}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {/* Want to Watch Button */}
                            <button
                              onClick={() =>
                                handleToggleWantToWatch(rec, isInWantToWatch)
                              }
                              className={`px-3 py-1.5 rounded-full flex items-center justify-center transition-all duration-200 text-xs font-medium flex-shrink-0 ${
                                isInWantToWatch
                                  ? "bg-red-500 text-white"
                                  : "bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-red-500 hover:text-white border border-slate-200 dark:border-slate-600"
                              }`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill={isInWantToWatch ? "currentColor" : "none"}
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                              </svg>
                            </button>

                            {/* Rating Button */}
                            <button
                              onClick={() => handleOpenRatingModal(rec)}
                              className={`px-3 py-1.5 rounded-full flex items-center justify-center transition-all duration-200 text-xs font-medium flex-shrink-0 ${
                                userRating
                                  ? "bg-yellow-500 text-white"
                                  : "bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-300 hover:bg-yellow-500 hover:text-white border border-slate-200 dark:border-slate-600"
                              }`}
                            >
                              {userRating ? (
                                <span>{userRating}/10</span>
                              ) : (
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Match Score */}
                        {rec.matchScore && rec.matchLevel && (
                          <div
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-3 ${matchDisplay.bgColor} ${matchDisplay.color}`}
                          >
                            <span className="text-lg">
                              {matchDisplay.emoji}
                            </span>
                            <span>
                              We think you'll{" "}
                              {rec.matchLevel.toLowerCase().replace(" ", " ")}{" "}
                              it
                            </span>
                            <span className="font-bold">
                              ({rec.matchScore}% match)
                            </span>
                          </div>
                        )}

                        {/* Recommendation Reasons */}
                        <div className="space-y-3">
                          {/* Enhanced Reason (Social Proof) */}
                          {rec.enhancedReason && (
                            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              {rec.enhancedReason
                                .split("\n")
                                .map((line: string, i: number) => (
                                  <p key={i} className="mb-1">
                                    {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                                  </p>
                                ))}
                            </div>
                          )}

                          {/* Personalized Reason (AI-generated detailed explanation) */}
                          {rec.personalizedReason && (
                            <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                              <p>{rec.personalizedReason}</p>
                            </div>
                          )}

                          {/* Fallback to basic reason if neither enhanced nor personalized exists */}
                          {!rec.enhancedReason && !rec.personalizedReason && (
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                              {rec.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {ratingModal.movie && (
          <RatingModal
            movie={ratingModal.movie}
            isOpen={ratingModal.isOpen}
            onClose={closeRatingModal}
            onRate={handleRateMovie}
            currentRating={
              ratedMovies.find((rm) => rm.id === ratingModal.movie!.id)?.rating
            }
          />
        )}
      </div>
    </div>
  );
};
