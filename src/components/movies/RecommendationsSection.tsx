"use client";

import { useState, useEffect } from "react";
import { Recommendation } from "@/types/movie";

interface RecommendationsSectionProps {
  ratedMoviesCount: number;
  onGenerateRecommendations: () => void;
  isLoading?: boolean;
  recommendations?: Recommendation[];
}

export const RecommendationsSection = ({
  ratedMoviesCount,
  onGenerateRecommendations,
  isLoading = false,
  recommendations = [],
}: RecommendationsSectionProps) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const hasRatedMovies = ratedMoviesCount > 0;
  const hasRecommendations = recommendations.length > 0;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-16">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Your Recommendations
      </h3>

      {!hasRecommendations && isClient && (
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          {hasRatedMovies
            ? "Ready to get personalized recommendations based on your ratings!"
            : "Rate at least 3 movies to get personalized recommendations!"}
        </p>
      )}

      {hasRecommendations && (
        <div className="mb-4">
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div
                key={index}
                className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3"
              >
                <h4 className="font-medium text-slate-900 dark:text-white text-sm mb-1">
                  {rec.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {rec.reason}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onGenerateRecommendations}
        disabled={!isClient || !hasRatedMovies || isLoading}
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
  );
};
