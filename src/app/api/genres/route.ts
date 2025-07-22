import { NextResponse } from "next/server";
import { API_CONFIG } from "@/lib/constants";

// RENDERING STRATEGY: Server-Side Rendering (SSR) with Extended Caching
// - This API route handles genre list requests with long-term caching
// - Uses Next.js fetch caching with extended revalidation for genre stability
// - Benefits: Long-term caching, secure API key handling, optimal performance
// - Perfect for: Genre list that rarely changes (genres are very stable)
// - Why long-term caching? Movie genres are extremely stable and rarely updated
//
// DUAL-CACHING ARCHITECTURE:
// - SERVER-SIDE: Next.js fetch caching with ISR (7-day revalidation)
// - CLIENT-SIDE: React Query caching with 24-hour stale time + 7-day garbage collection
// - CACHE TAGS: Selective invalidation (genres-list)
// - HTTP HEADERS: Extended CDN and browser caching with 30-day stale-while-revalidate
//
// NEXT.JS OPTIMIZATIONS:
// - fetch() caching with 7-day revalidation for genre stability
// - Cache tags for selective invalidation (genres-list)
// - Extended HTTP Cache-Control with 30-day stale-while-revalidate
// - Genre data is extremely stable, so we can cache aggressively
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Very stale data vs. maximum performance and minimal API calls
// - VERCEL OPTIMIZATIONS: Edge functions, global distribution, CDN caching
// - SCALE BREAKERS: TMDB rate limits, high concurrent requests
// - FUTURE IMPROVEMENTS: Background cache warming, cache analytics

export async function GET() {
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
      `${API_CONFIG.TMDB_BASE_URL}/genre/movie/list?api_key=${apiKey}&language=${API_CONFIG.DEFAULT_LANGUAGE}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        // Next.js fetch caching with 7-day revalidation - genres are very stable
        next: {
          revalidate: 60 * 60 * 24 * 7, // 7 days - genres rarely change
          tags: ["genres-list"], // Tag for manual cache invalidation
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    // Return with extended HTTP caching headers for maximum performance
    // Client-side React Query will handle additional caching with 24-hour stale time
    return NextResponse.json(data, {
      headers: {
        "Cache-Control":
          "public, s-maxage=604800, stale-while-revalidate=2592000", // 7 days + 30 days stale
      },
    });
  } catch (error) {
    console.error("Failed to fetch genres:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch genres",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
