import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// RENDERING STRATEGY: Server-Side Rendering (SSR) with Short-term Dual-Caching
// - This API route handles movie search requests with intelligent caching
// - Uses Next.js fetch caching with short revalidation for search result freshness
// - Benefits: Cached search results, secure API key handling, reduced rate limiting
// - Perfect for: Search results that can change as new movies are added to TMDB
// - Why short-term caching? Search results may change as new movies are indexed
//
// DUAL-CACHING ARCHITECTURE:
// - SERVER-SIDE: Next.js fetch caching with ISR (30-minute revalidation)
// - CLIENT-SIDE: React Query caching with 5-minute stale time + 30-minute garbage collection
// - CACHE TAGS: Selective invalidation (search-{query}-page-{page})
// - HTTP HEADERS: CDN and browser caching with 1-hour stale-while-revalidate
//
// NEXT.JS OPTIMIZATIONS:
// - fetch() caching with 30-minute revalidation for search freshness
// - Cache tags for selective invalidation (search-{query}-page-{page})
// - HTTP Cache-Control with 1-hour stale-while-revalidate
// - Query parameter validation and encoding for security
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Search freshness vs. performance and rate limit protection
// - VERCEL OPTIMIZATIONS: Edge functions, global distribution, CDN caching
// - SCALE BREAKERS: TMDB rate limits, high search volume, query complexity
// - FUTURE IMPROVEMENTS: Search result ranking, query analytics, autocomplete

const getApiKey = (): string => {
  const apiKey = process.env.TMDB_API_KEY || "";
  if (!apiKey) {
    console.warn(
      "TMDB API key not found. Please set TMDB_API_KEY in your environment variables."
    );
  }
  return apiKey;
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const page = searchParams.get("page") || "1";

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  const apiKey = getApiKey();

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key not configured" },
      { status: 500 }
    );
  }

  try {
    const encodedQuery = encodeURIComponent(query);

    // Server-side fetch with short-term caching for search freshness
    // Search results can change as new movies are added to TMDB
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&language=en-US&query=${encodedQuery}&page=${page}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        // Next.js fetch caching with 30-minute revalidation for search freshness
        next: {
          revalidate: 60 * 30, // 30 minutes - search results can change
          tags: [`search-${encodedQuery}-page-${page}`], // Tag for manual cache invalidation
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Return with HTTP caching for search result optimization
    // Client-side React Query will handle additional caching with 5-minute stale time
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600", // 30 minutes + 1 hour stale
      },
    });
  } catch (error) {
    console.error("Failed to search movies:", error);

    return NextResponse.json(
      {
        error: "Failed to search movies",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
