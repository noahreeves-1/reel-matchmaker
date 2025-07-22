import { NextResponse } from "next/server";
import { API_CONFIG } from "@/lib/constants";

// Genres API route with extended caching for stable genre data
// Uses dual-caching: server-side Next.js cache + client-side React Query cache

export async function GET() {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "TMDB API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `${API_CONFIG.TMDB_BASE_URL}/genre/movie/list?api_key=${apiKey}&language=${API_CONFIG.DEFAULT_LANGUAGE}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: {
          revalidate: 60 * 60 * 24 * 7,
          tags: ["genres-list"],
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
        "Cache-Control":
          "public, s-maxage=604800, stale-while-revalidate=2592000",
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
