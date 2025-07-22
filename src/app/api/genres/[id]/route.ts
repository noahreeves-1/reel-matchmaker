import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/lib/constants";

// RENDERING STRATEGY: Server-Side Rendering (SSR) with ISR Caching
// - This API route handles genre-specific movie requests with intelligent caching
// - Uses Next.js fetch caching with hourly revalidation for genre movie freshness
// - Benefits: Cached responses, secure API key handling, reduced TMDB rate limiting
// - Perfect for: Genre movie lists that change daily but not hourly
// - Why hourly caching? Movies in genres change as new movies are released
//
// DUAL-CACHING ARCHITECTURE:
// - SERVER-SIDE: Next.js fetch caching with ISR (1-hour revalidation)
// - CLIENT-SIDE: React Query caching with 30-minute stale time + 2-hour garbage collection
// - CACHE TAGS: Selective invalidation (genre-{id}-page-{page})
// - HTTP HEADERS: CDN and browser caching with 6-hour stale-while-revalidate
//
// NEXT.JS OPTIMIZATIONS:
// - fetch() caching with 1-hour revalidation for genre movie freshness
// - Cache tags for selective invalidation (genre-{id}-page-{page})
// - HTTP Cache-Control headers for CDN and browser caching
// - Stale-while-revalidate for instant responses with background updates
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Slightly stale data vs. performance and rate limit protection
// - VERCEL OPTIMIZATIONS: Edge functions, automatic scaling, global distribution
// - SCALE BREAKERS: TMDB rate limits (1000 requests/day), high concurrent requests
// - FUTURE IMPROVEMENTS: Redis caching, request batching, rate limit handling

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get("page") || "1";
  const { id: genreId } = await params;

  if (!genreId || isNaN(Number(genreId))) {
    return NextResponse.json({ error: "Invalid genre ID" }, { status: 400 });
  }

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
      `${API_CONFIG.TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&language=${API_CONFIG.DEFAULT_LANGUAGE}&with_genres=${genreId}&page=${page}&sort_by=popularity.desc`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        // Next.js fetch caching with 1-hour revalidation - genre movies change daily
        next: {
          revalidate: 60 * 60, // 1 hour - genre movies change as new movies are released
          tags: [`genre-${genreId}-page-${page}`], // Tag for manual cache invalidation
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
    // Client-side React Query will handle additional caching with 30-minute stale time
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=21600", // 1 hour + 6 hours stale
      },
    });
  } catch (error) {
    console.error("Failed to fetch movies by genre:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch movies by genre",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
