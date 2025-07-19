import { NextRequest, NextResponse } from "next/server";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

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

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}`
      );
    }

    const movie = await response.json();
    return NextResponse.json(movie);
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return NextResponse.json(
      { error: "Failed to fetch movie details" },
      { status: 500 }
    );
  }
}
