import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/lib/constants";

// Genre movies API route with hourly caching for genre movie freshness
// Uses dual-caching: server-side Next.js cache + client-side React Query cache

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
    const response = await fetch(
      `${API_CONFIG.TMDB_BASE_URL}/discover/movie?api_key=${apiKey}&language=${API_CONFIG.DEFAULT_LANGUAGE}&with_genres=${genreId}&page=${page}&sort_by=popularity.desc`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: {
          revalidate: 60 * 60,
          tags: [`genre-${genreId}-page-${page}`],
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
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=21600",
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
