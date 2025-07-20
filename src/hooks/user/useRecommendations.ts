import { useState } from "react";
import {
  MovieRecommendation,
  RatedMovie,
  WantToWatchMovie,
} from "@/types/movie";
import { useLocalStorage, STORAGE_KEYS } from "@/lib";

// useRecommendations Hook: Manages AI-powered movie recommendations
// This hook encapsulates all the logic for generating and managing recommendations
// It integrates with the user's rated movies and want-to-watch list
export const useRecommendations = () => {
  // Local Storage Integration: Read user data from localStorage
  // We only read here, not write, to avoid conflicts with other hooks
  const [ratedMovies] = useLocalStorage<RatedMovie[]>(
    STORAGE_KEYS.RATED_MOVIES,
    []
  );
  const [wantToWatchList] = useLocalStorage<WantToWatchMovie[]>(
    STORAGE_KEYS.WANT_TO_WATCH,
    []
  );

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
          errorData.error || "Failed to generate recommendations"
        );
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      // Error Propagation: Re-throw errors to be handled by the component
      // This allows components to show user-friendly error messages
      throw error;
    } finally {
      // Cleanup: Always reset loading state, even if there's an error
      setIsGeneratingRecommendations(false);
    }
  };

  return {
    recommendations,
    isGeneratingRecommendations,
    generateRecommendations,
    ratedMoviesCount: ratedMovies.length,
    wantToWatchCount: wantToWatchList.length,
  };
};
