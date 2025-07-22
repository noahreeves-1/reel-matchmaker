import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { RatedMovie, WantToWatchMovie } from "@/types/movie";
import { auth } from "@/auth";
import { saveRecommendations } from "@/lib/db-utils";

// AI-powered movie recommendations API route
// Uses server-side AI processing with OpenAI GPT-4 for personalized recommendations
// No server-side caching - each user gets unique recommendations

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  revenue?: number;
  popularity?: number;
}

interface Recommendation extends TMDBMovie {
  reason: string;
  personalizedReason: string;
  matchScore?: number;
  matchLevel?: "LOVE IT" | "LIKE IT" | "MAYBE" | "RISKY";
  enhancedReason?: string;
  backdrop_path?: string | null;
  overview?: string;
  runtime?: number;
  status?: string;
  tagline?: string;
  budget?: number;
  genres?: Array<{ id: number; name: string }>;
  production_companies?: Array<{
    id: number;
    name: string;
    logo_path: string | null;
    origin_country: string;
  }>;
}

const getApiKey = (): string => {
  const apiKey = process.env.TMDB_API_KEY || "";
  if (!apiKey) {
    console.warn(
      "TMDB API key not found. Please set TMDB_API_KEY in your environment variables."
    );
  }
  return apiKey;
};

async function getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("TMDB API key not available for movie details");
    return null;
  }

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${apiKey}&language=en-US`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch movie ${movieId}: ${response.statusText}`);
      return null;
    }

    const movie = await response.json();
    return {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      revenue: movie.revenue,
      popularity: movie.popularity,
    };
  } catch (error) {
    console.error(`Error fetching movie ${movieId}:`, error);
    return null;
  }
}

async function searchMovieByTitle(
  title: string
): Promise<Recommendation | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("TMDB API key not available for movie search");
    return null;
  }

  try {
    const encodedTitle = encodeURIComponent(title);
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&language=en-US&query=${encodedTitle}&page=1`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.warn(
        `Failed to search for movie "${title}": ${response.statusText}`
      );
      return null;
    }

    const searchResult = await response.json();
    const movies = searchResult.results;

    if (!movies || movies.length === 0) {
      console.warn(`No movies found for title: "${title}"`);
      return null;
    }

    const bestMatch = movies[0];
    const matchScore = calculateMatchScore(bestMatch);

    return {
      id: bestMatch.id,
      title: bestMatch.title,
      poster_path: bestMatch.poster_path,
      release_date: bestMatch.release_date,
      vote_average: bestMatch.vote_average,
      vote_count: bestMatch.vote_count,
      revenue: bestMatch.revenue,
      popularity: bestMatch.popularity,
      reason: `Found "${title}" in TMDB database`,
      personalizedReason: `Based on your preferences, "${title}" matches your taste`,
      matchScore: matchScore.score,
      matchLevel: matchScore.level,
      enhancedReason: createEnhancedReason(bestMatch),
    };
  } catch (error) {
    console.error(`Error searching for movie "${title}":`, error);
    return null;
  }
}

function calculateMatchScore(movie: TMDBMovie): {
  score: number;
  level: "LOVE IT" | "LIKE IT" | "MAYBE" | "RISKY";
} {
  const { vote_average, vote_count, popularity } = movie;

  let score = 0;

  if (vote_average >= 7.5 && vote_count >= 1000) {
    score += 40;
  } else if (vote_average >= 7.0 && vote_count >= 500) {
    score += 30;
  } else if (vote_average >= 6.5 && vote_count >= 100) {
    score += 20;
  } else if (vote_average >= 6.0) {
    score += 10;
  }

  if (popularity && popularity > 100) {
    score += 20;
  } else if (popularity && popularity > 50) {
    score += 15;
  } else if (popularity && popularity > 20) {
    score += 10;
  }

  if (score >= 50) return { score, level: "LOVE IT" };
  if (score >= 35) return { score, level: "LIKE IT" };
  if (score >= 20) return { score, level: "MAYBE" };
  return { score, level: "RISKY" };
}

interface AIRecommendation {
  title: string;
  reason: string;
  personalizedReason: string;
}

function createEnhancedReason(movie: TMDBMovie): string {
  const { vote_average, vote_count, popularity } = movie;

  let reason = `"${movie.title}" is a ${
    vote_average >= 7.5
      ? "highly acclaimed"
      : vote_average >= 7.0
      ? "well-received"
      : "decent"
  } film`;

  if (vote_count >= 10000) {
    reason += ` with over ${vote_count.toLocaleString()} ratings`;
  } else if (vote_count >= 1000) {
    reason += ` with ${vote_count.toLocaleString()} ratings`;
  }

  if (popularity && popularity > 100) {
    reason += ` and is currently trending`;
  }

  return reason;
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return Response.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { ratedMovies, wantToWatchList } = await req.json();

    if (!ratedMovies || !Array.isArray(ratedMovies)) {
      return Response.json(
        { error: "Invalid rated movies data" },
        { status: 400 }
      );
    }

    if (!wantToWatchList || !Array.isArray(wantToWatchList)) {
      return Response.json(
        { error: "Invalid want to watch list data" },
        { status: 400 }
      );
    }

    const userEmail = session.user.email;

    const prompt = `
You are a movie recommendation expert. Based on the user's rated movies and want-to-watch list, suggest 10 unique movie recommendations.

User's Rated Movies (with ratings 1-10):
${ratedMovies
  .map((movie: RatedMovie) => `- ${movie.title} (Rating: ${movie.rating}/10)`)
  .join("\n")}

User's Want-to-Watch List:
${wantToWatchList
  .map((movie: WantToWatchMovie) => `- ${movie.title}`)
  .join("\n")}

Please provide 10 movie recommendations in this exact JSON format:
[
  {
    "title": "Movie Title",
    "reason": "Brief reason why this movie matches their taste",
    "personalizedReason": "Personalized explanation based on their ratings"
  }
]

Focus on:
1. Movies similar to their highly rated films (8-10 ratings)
2. Movies from genres they enjoy
3. Movies with similar themes or directors
4. Popular and critically acclaimed films
5. Diverse recommendations across different genres

Return only the JSON array, no additional text.
`;

    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt,
      maxTokens: 2000,
    });

    let aiRecommendations: AIRecommendation[];
    try {
      aiRecommendations = JSON.parse(text);
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return Response.json(
        { error: "Failed to generate recommendations" },
        { status: 500 }
      );
    }

    const recommendations: Recommendation[] = [];

    for (const aiRec of aiRecommendations) {
      const movieDetails = await searchMovieByTitle(aiRec.title);

      if (movieDetails) {
        recommendations.push({
          ...movieDetails,
          reason: aiRec.reason,
          personalizedReason: aiRec.personalizedReason,
        });
      }
    }

    if (recommendations.length === 0) {
      return Response.json(
        { error: "No recommendations found" },
        { status: 404 }
      );
    }

    await saveRecommendations(userEmail, recommendations);

    return Response.json(recommendations);
  } catch (error) {
    console.error("Recommendation generation error:", error);
    return Response.json(
      { error: "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}
