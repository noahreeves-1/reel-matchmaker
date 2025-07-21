import { auth } from "@/auth";
import type { UserInitialData } from "@/types/movie";

// SERVER-ONLY UTILITIES: Database operations for SSR
// These functions are only used in server components and API routes
// They should never be imported by client components

export const getUserRatedMovies = async (): Promise<UserInitialData> => {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return { ratings: [], wantToWatch: [] };
    }

    // Use dynamic imports like the API routes to avoid isTTY errors
    const { getUserRatings, getWantToWatchList } = await import(
      "@/lib/db-utils"
    );

    const userEmail = session.user.email;
    const ratings = await getUserRatings(userEmail);
    const wantToWatch = await getWantToWatchList(userEmail);

    return {
      ratings: ratings || [],
      wantToWatch: wantToWatch || [],
    };
  } catch (error) {
    console.error("Failed to fetch user movies:", error);
    return { ratings: [], wantToWatch: [] };
  }
};
