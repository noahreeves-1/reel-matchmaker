import { MyMoviesPageServer } from "@/components/movies/MyMoviesPageServer";
import { getUserRatedMovies } from "@/lib/server-only";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// RENDERING STRATEGY: Server-Side Rendering (SSR)
// - This page is rendered on the server for each request
// - Server-side data fetching for user-specific content
// - Benefits: Fast initial load, good SEO, server-side authentication
// - Perfect for: User-specific pages that require fresh data
// - Why SSR? User data needs to be fetched server-side for security and performance
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Server-side processing, no caching, authentication complexity
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
 * Uses SSR for optimal performance and security
 * User data is fetched server-side, interactivity handled by client component
 */
export default async function MyMoviesPage() {
  // Server-side authentication check
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Server-side data fetching
  const userData = await getUserRatedMovies();

  return <MyMoviesPageServer initialData={userData} />;
}
