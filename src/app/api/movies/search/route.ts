import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Movie search API route with short-term caching for search freshness
// Uses dual-caching: server-side Next.js cache + client-side React Query cache

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

    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&language=en-US&query=${encodedQuery}&page=${page}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        next: {
          revalidate: 60 * 30,
          tags: [`search-${encodedQuery}-page-${page}`],
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
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=3600",
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
