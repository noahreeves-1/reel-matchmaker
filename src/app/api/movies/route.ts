import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/lib/constants";

// Popular movies API route with Next.js fetch caching and ISR
// Uses dual-caching: server-side Next.js cache + client-side React Query cache

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
    const response = await fetch(
      `${API_CONFIG.TMDB_BASE_URL}/movie/popular?api_key=${apiKey}&language=${API_CONFIG.DEFAULT_LANGUAGE}&page=${page}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: {
          revalidate: 60 * 60,
          tags: [`popular-movies-page-${page}`],
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
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
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
