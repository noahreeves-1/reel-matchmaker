import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/lib/constants";

// RENDERING STRATEGY: Server-Side Rendering (SSR) for API with caching
// - This API route runs on the server for every request
// - Added caching to reduce TMDB API calls and improve performance
// - Benefits: Cached data, secure API key handling, reduced rate limiting
// - Perfect for: API endpoints that can tolerate slightly stale data
// - Why SSR with caching? We want fresh data but also want to respect TMDB rate limits
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Slightly stale data vs. performance and rate limit protection
// - VERCEL OPTIMIZATIONS: Edge functions, automatic scaling, global distribution, caching
// - SCALE BREAKERS: TMDB rate limits (1000 requests/day), high concurrent requests
// - FUTURE IMPROVEMENTS: Add Redis caching, request batching, rate limit handling
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";

  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key not configured" },
      { status: 500 }
    );
  }

  try {
    // External API Call: This runs on the server, so it's secure
    // The API key is never exposed to the client
    const response = await fetch(
      `${API_CONFIG.TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=${API_CONFIG.DEFAULT_LANGUAGE}&page=${page}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        // Add Next.js caching - cache for 1 hour (popular movies change frequently)
        next: {
          revalidate: 60 * 60, // 1 hour
          tags: [`popular-movies-page-${page}`], // Tag for cache invalidation
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400", // 1 hour + 24 hours stale
      },
    });
  } catch (error) {
    console.error("Failed to fetch movies:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch movies",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
