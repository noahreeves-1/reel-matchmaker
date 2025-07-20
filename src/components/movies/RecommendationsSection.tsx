"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { RatedMovie, MovieRecommendation } from "@/types/movie";
import { RatingModal } from "./RatingModal";

// RECOMMENDATIONS SECTION: AI-powered movie recommendations display
// This component displays personalized movie recommendations with interactive features
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Expensive AI calls, no caching, client-side state management
// - VERCEL OPTIMIZATIONS: Static hosting for UI, client-side processing
// - SCALE BREAKERS: OpenAI rate limits, high costs, slow response times
// - FUTURE IMPROVEMENTS: Add recommendation caching, batch processing, cost optimization

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
    movie: MovieRecommendation,
    isInWantToWatch: boolean
  ) => {
    // This would typically call a function to toggle want to watch
    // For now, we'll just log the action
    console.log(
      `${isInWantToWatch ? "Removing" : "Adding"} ${
        movie.title
      } to want to watch list`
    );
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

        {hasRecommendations && (
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

                        {/* Enhanced Recommendation Reason */}
                        {rec.enhancedReason ? (
                          <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {rec.enhancedReason
                              .split("\n")
                              .map((line: string, i: number) => (
                                <p key={i} className="mb-2">
                                  {line.replace(/\*\*(.*?)\*\*/g, "$1")}
                                </p>
                              ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            {rec.reason}
                          </p>
                        )}
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
