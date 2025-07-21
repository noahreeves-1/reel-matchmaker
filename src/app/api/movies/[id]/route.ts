import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// RENDERING STRATEGY: Server-Side Rendering (SSR) with Extended Dual-Caching
// - This API route handles dynamic movie detail requests with intelligent caching
// - Uses Next.js fetch caching with extended revalidation for movie data stability
// - Benefits: Long-term caching, secure API key handling, optimal performance
// - Perfect for: Movie details that rarely change (title, cast, release date, etc.)
// - Why long-term caching? Movie metadata is extremely stable and rarely updated
//
// DUAL-CACHING ARCHITECTURE:
// - SERVER-SIDE: Next.js fetch caching with ISR (24-hour revalidation)
// - CLIENT-SIDE: React Query caching with 24-hour stale time + 7-day garbage collection
// - CACHE TAGS: Selective invalidation (movie-{id})
// - HTTP HEADERS: Extended CDN and browser caching with 7-day stale-while-revalidate
//
// NEXT.JS OPTIMIZATIONS:
// - fetch() caching with 24-hour revalidation for movie data stability
// - Cache tags for selective invalidation (movie-{id})
// - Extended HTTP Cache-Control with 7-day stale-while-revalidate
// - Dynamic route parameter handling with proper validation
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Very stale data vs. maximum performance and minimal API calls
// - VERCEL OPTIMIZATIONS: Edge functions, global distribution, CDN caching
// - SCALE BREAKERS: TMDB rate limits, high concurrent requests for popular movies
// - FUTURE IMPROVEMENTS: Background cache warming, cache analytics

const getApiKey = (): string => {
  const apiKey = process.env.TMDB_API_KEY || "";
  if (!apiKey) {
    console.warn(
      "TMDB API key not found. Please set TMDB_API_KEY in your environment variables."
    );
  }
  return apiKey;
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      return NextResponse.json(
        { error: "TMDB API key not configured" },
        { status: 500 }
      );
    }

    const { id: movieId } = await params;

    if (!movieId || isNaN(Number(movieId))) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const url = `${TMDB_BASE_URL}/movie/${movieId}?api_key=${apiKey}&language=en-US`;

    // Server-side fetch with extended caching for movie data stability
    // Movie details rarely change, so we can cache aggressively
    const response = await fetch(url, {
      // Next.js fetch caching with 24-hour revalidation
      next: {
        revalidate: 60 * 60 * 24, // 24 hours - movie data is very stable
        tags: [`movie-${movieId}`], // Tag for manual cache invalidation
      },
    });

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`
      );
    }

    const movie = await response.json();

    // Return with extended HTTP caching for maximum performance
    // Client-side React Query will handle additional caching with 24-hour stale time
    return NextResponse.json(movie, {
      headers: {
        "Cache-Control":
          "public, s-maxage=86400, stale-while-revalidate=604800", // 24 hours + 7 days stale
      },
    });
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return NextResponse.json(
      { error: "Failed to fetch movie details" },
      { status: 500 }
    );
  }
}
