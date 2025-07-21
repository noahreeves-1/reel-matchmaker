import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/lib/constants";

// RENDERING STRATEGY: Server-Side Rendering (SSR) with Dual-Caching Architecture
// - This API route runs on the server with intelligent caching
// - Uses Next.js fetch caching with revalidation for optimal performance
// - Benefits: Cached responses, secure API key handling, reduced TMDB rate limiting
// - Perfect for: Popular movies data that changes infrequently but needs to stay fresh
// - Why SSR with ISR? Popular movies don't change often, but we want to respect TMDB rate limits
//
// DUAL-CACHING ARCHITECTURE:
// - SERVER-SIDE: Next.js fetch caching with ISR (1 hour revalidation)
// - CLIENT-SIDE: React Query caching with 5-minute stale time + 30-minute garbage collection
// - CACHE TAGS: Selective invalidation (popular-movies-page-{page})
// - HTTP HEADERS: CDN and browser caching with stale-while-revalidate
//
// NEXT.JS OPTIMIZATIONS:
// - fetch() caching with next.revalidate for automatic cache invalidation
// - Cache tags for selective invalidation (popular-movies-page-{page})
// - HTTP Cache-Control headers for CDN and browser caching
// - Stale-while-revalidate for instant responses with background updates
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Slightly stale data vs. performance and rate limit protection
// - VERCEL OPTIMIZATIONS: Edge functions, automatic scaling, global distribution
// - SCALE BREAKERS: TMDB rate limits (1000 requests/day), high concurrent requests
// - FUTURE IMPROVEMENTS: Redis caching, request batching, rate limit handling
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
    // External API Call: Server-side fetch with Next.js caching
    // The API key is never exposed to the client, ensuring security
    const response = await fetch(
      `${API_CONFIG.TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=${API_CONFIG.DEFAULT_LANGUAGE}&page=${page}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        // Next.js fetch caching with ISR - cache for 1 hour with automatic revalidation
        next: {
          revalidate: 60 * 60, // 1 hour - popular movies change infrequently
          tags: [`popular-movies-page-${page}`], // Tag for manual cache invalidation
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Return with HTTP caching headers for CDN and browser optimization
    // Client-side React Query will handle additional caching with 5-minute stale time
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
