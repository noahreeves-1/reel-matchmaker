import { MyMoviesPage } from "@/components/movies/MyMoviesPage";
import { getUserRatedMovies } from "@/lib/server-functions";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// RENDERING STRATEGY: Server-Side Rendering (SSR) - Required for Authentication
// - This page MUST use SSR because it requires authentication and user-specific data
// - Cannot use SSG because content is different for each user and requires session validation
// - Benefits: Secure authentication, fresh user data, good SEO for authenticated users
// - Perfect for: User-specific pages that require authentication and real-time data
// - Why SSR? User data is private and must be fetched server-side for security
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Server-side processing, no caching, authentication overhead
// - VERCEL OPTIMIZATIONS: Serverless functions, edge caching, automatic scaling
// - SCALE BREAKERS: High concurrent users, database connection limits
// - FUTURE IMPROVEMENTS: Add caching, optimistic updates, real-time sync

// Generate metadata for SEO
export const metadata = {
  title: "My Movies - Reel Matchmaker",
  description: "Your personal movie collection with ratings and watchlist",
  keywords: ["my movies", "ratings", "watchlist", "personal", "collection"],
};

/**
 * My Movies page component
 * Uses SSR for authentication and user-specific data fetching
 * Server handles auth + data fetching, client handles interactivity
 */
export default async function MyMoviesPageRoute() {
  // Server-side authentication check - required for user-specific data
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Server-side data fetching for initial page load
  const userData = await getUserRatedMovies();

  // Pass data to client component for interactivity
  return <MyMoviesPage initialData={userData} />;
}
