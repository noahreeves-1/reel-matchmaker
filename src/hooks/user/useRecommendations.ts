import { useState, useEffect } from "react";
import {
  MovieRecommendation,
  RatedMovie,
  WantToWatchMovie,
} from "@/types/movie";
import { handleApiError } from "@/lib/errorHandling";

// Manages AI-powered movie recommendations
// This hook encapsulates all the logic for generating and managing recommendations
// It accepts rated movies and want-to-watch list as parameters to ensure consistency
export const useRecommendations = (
  ratedMovies: RatedMovie[] = [],
  wantToWatchList: WantToWatchMovie[] = []
) => {
  const [recommendations, setRecommendations] = useState<MovieRecommendation[]>(
    []
  );
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] =
    useState(false);
  const [isLoadingLastRecommendations, setIsLoadingLastRecommendations] =
    useState(false);

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
      } finally {
        console.log(
          "🔄 useRecommendations: Finished loading last recommendations"
        );
        setIsLoadingLastRecommendations(false);
      }
    };

    loadLastRecommendations();
  }, []);

  const generateRecommendations = async (): Promise<void> => {
    setIsGeneratingRecommendations(true);

    try {
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
        throw new Error(
          handleApiError(
            errorData.error || "Failed to generate recommendations"
          )
        );
      }

      const data = await response.json();

      setRecommendations(data);

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
      throw new Error(handleApiError(error));
    } finally {
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
