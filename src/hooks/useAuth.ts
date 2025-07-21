import { signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// AUTH HOOK: Authentication state management for client-side actions
// This hook provides authentication utilities for protected client actions
// Note: In NextAuth.js v5, most auth checks should be done server-side
// This hook is mainly for client-side redirects and actions

export const useAuth = () => {
  const router = useRouter();

  // Prompt user to login when trying to access protected features
  const requireAuth = (action: string, callback?: () => void) => {
    // Store the intended action in sessionStorage for after login
    if (typeof window !== "undefined") {
      sessionStorage.setItem("pendingAction", action);
    }

    // Redirect to login with current page as callback
    const currentPath = window.location.pathname + window.location.search;
    signIn(undefined, { callbackUrl: currentPath });
    return false;
  };

  // Handle rating a movie (protected action)
  const rateMovie = (movieId: number, rating: number) => {
    return requireAuth("rate_movie", () => {
      // TODO: Implement rating logic with database
      console.log(`Rating movie ${movieId} with ${rating} stars`);
    });
  };

  // Handle adding movie to want-to-watch (protected action)
  const addToWantToWatch = (movieId: number) => {
    return requireAuth("add_to_watchlist", () => {
      // TODO: Implement want-to-watch logic with database
      console.log(`Adding movie ${movieId} to want-to-watch list`);
    });
  };

  // Handle generating recommendations (protected action)
  const generateRecommendations = () => {
    return requireAuth("generate_recommendations", () => {
      // TODO: Implement recommendation generation with database
      console.log("Generating personalized recommendations");
    });
  };

  // Sign out user
  const logout = () => {
    signOut({ callbackUrl: "/" });
  };

  return {
    requireAuth,
    rateMovie,
    addToWantToWatch,
    generateRecommendations,
    logout,
  };
};
