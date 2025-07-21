import { useState } from "react";
import {
  MovieRecommendation,
  RatedMovie,
  WantToWatchMovie,
} from "@/types/movie";
import { handleApiError } from "@/lib/errorHandling";

// useRecommendations Hook: Manages AI-powered movie recommendations
// This hook encapsulates all the logic for generating and managing recommendations
// It accepts rated movies and want-to-watch list as parameters to ensure consistency
export const useRecommendations = (
  ratedMovies: RatedMovie[] = [],
  wantToWatchList: WantToWatchMovie[] = []
) => {
  // Local State: Manage recommendations and loading state
  // This state is specific to this hook and doesn't persist
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>(
    []
  );
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] =
    useState(false);

  // generateRecommendations: Main function to get AI recommendations
  // This function:
  // 1. Sends user's rated movies and want-to-watch list to the AI
  // 2. Handles loading states
  // 3. Uses proper error handling with custom error types
  const generateRecommendations = async (): Promise<void> => {
    setIsGeneratingRecommendations(true);

    try {
      // API Call: Send user data to our recommendation API
      // The API uses AI to generate personalized movie suggestions
      const response = await fetch("/api/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ratedMovies,
          wantToWatchList,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Custom Error: Use our error handling system for better debugging
        throw new Error(
          handleApiError(
            errorData.error || "Failed to generate recommendations"
          )
        );
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (error) {
      // Error Propagation: Re-throw errors to be handled by the component
      // This allows components to show user-friendly error messages
      throw new Error(handleApiError(error));
    } finally {
      // Cleanup: Always reset loading state, even if there's an error
      setIsGeneratingRecommendations(false);
    }
  };

  return {
    recommendations,
    isGeneratingRecommendations,
    generateRecommendations,
  };
};
