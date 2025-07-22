import { useState, useEffect } from "react";
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
  const [isLoadingLastRecommendations, setIsLoadingLastRecommendations] =
    useState(false);

  // Load last recommendations on mount
  useEffect(() => {
    const loadLastRecommendations = async () => {
      console.log(
        "🔄 useRecommendations: Starting to load last recommendations..."
      );
      setIsLoadingLastRecommendations(true);
      try {
        console.log(
          "🔄 useRecommendations: Making API call to /api/recommendations?last=true&limit=5"
        );
        const response = await fetch("/api/recommendations?last=true&limit=5");
        console.log(
          "🔄 useRecommendations: API response status:",
          response.status
        );

        if (response.ok) {
          const data = await response.json();
          console.log("🔄 useRecommendations: API response data:", data);

          if (data.success && data.recommendations.length > 0) {
            console.log(
              "🔄 useRecommendations: Setting recommendations:",
              data.recommendations
            );
            setRecommendations(data.recommendations);
          } else {
            console.log(
              "🔄 useRecommendations: No recommendations found or API returned failure"
            );
          }
        } else {
          console.log(
            "🔄 useRecommendations: API call failed with status:",
            response.status
          );
        }
      } catch (error) {
        console.error(
          "❌ useRecommendations: Error loading last recommendations:",
          error
        );
        // Don't throw error here - this is just for loading previous recommendations
      } finally {
        console.log(
          "🔄 useRecommendations: Finished loading last recommendations"
        );
        setIsLoadingLastRecommendations(false);
      }
    };

    loadLastRecommendations();
  }, []); // Only run on mount

  // generateRecommendations: Main function to get AI recommendations
  // This function:
  // 1. Sends user's rated movies and want-to-watch list to the AI
  // 2. Handles loading states
  // 3. Uses proper error handling with custom error types
  // 4. Reloads the latest recommendations from database after generation
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

      // Update local state with the new recommendations
      setRecommendations(data);

      // Also reload the latest recommendations from database to ensure consistency
      // This ensures we have the most up-to-date data after saving to database
      console.log(
        "🔄 useRecommendations: Reloading latest recommendations from database..."
      );
      const latestResponse = await fetch(
        "/api/recommendations?last=true&limit=5"
      );
      if (latestResponse.ok) {
        const latestData = await latestResponse.json();
        if (latestData.success && latestData.recommendations.length > 0) {
          console.log(
            "🔄 useRecommendations: Updated with latest from database:",
            latestData.recommendations
          );
          setRecommendations(latestData.recommendations);
        }
      }
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
    isLoadingLastRecommendations,
    generateRecommendations,
  };
};
