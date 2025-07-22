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

    const movieDetails = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      revenue: movie.revenue,
      popularity: movie.popularity,
    };

    return movieDetails;
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

    // Build lists for the prompt
    const likedMovies = ratedMovies.filter(
      (movie: RatedMovie) => movie.rating >= 7
    );
    const wantToWatchMoviesList = wantToWatchList
      .map((movie: WantToWatchMovie) => movie.title)
      .join(", ");
    const ratedMovieKeys = new Set(
      ratedMovies.map((movie: RatedMovie) => movie.title)
    );
    const wantToWatchKeys = new Set(
      wantToWatchList.map((movie: WantToWatchMovie) => movie.title)
    );

    const { text } = await generateText({
      model: openai("gpt-4.1-mini"),
      messages: [
        {
          role: "system",
          content:
            "You are a movie recommendation expert with a fun, creative personality. Provide accurate, helpful movie recommendations based on user preferences. You MUST always respond with valid JSON in the exact format specified. Do not include any additional text, explanations, or markdown formatting - only the JSON array.",
        },
        {
          role: "user",
          content: `Based on these movies the user rated highly (7+ stars): ${likedMovies
            .map((movie: RatedMovie) => `${movie.title} - (${movie.rating}/10)`)
            .join(", ")}

The user has also rated these other movies: ${ratedMovies
            .filter((movie: RatedMovie) => movie.rating < 7)
            .map((movie: RatedMovie) => `${movie.title} - (${movie.rating}/10)`)
            .join(", ")}

The user has these movies in their want to watch list (movies they want to see): ${
            wantToWatchMoviesList || "None"
          }

Please recommend 5 movies that the user would likely enjoy. For each recommendation, provide:
1. The exact movie title (including the year if there are multiple movies with the same title)
2. A brief reason why you're recommending it (1-2 sentences)
3. A detailed, personalized reason that includes: what the movie is about, why it's interesting based on their taste, what audiences/critics think about it, AND a sentence about how others who liked similar movies to the user's highly-rated films also enjoyed this movie (3-4 sentences total)

IMPORTANT: Do NOT recommend any movies that the user has already rated or has in their want to watch list. The user has rated these movies: ${Array.from(
            ratedMovieKeys
          ).join(", ")}. The user has these in their want to watch list: ${
            Array.from(wantToWatchKeys).join(", ") || "None"
          }

You MUST respond with ONLY a JSON array containing objects with "title", "reason", and "personalizedReason" fields.

Example format:
[
  {
    "title": "Movie Title",
    "reason": "This action-packed thriller shares similar themes and pacing to movies you rated highly.",
    "personalizedReason": "This gripping psychological thriller follows a detective's descent into madness as he investigates a series of increasingly disturbing crimes. Given your love for complex character studies like The Dark Knight (10/10), you'll appreciate how this film explores the blurred lines between justice and obsession. Critics praised its atmospheric tension and mind-bending plot twists, with audiences calling it 'a masterclass in psychological suspense' that keeps you guessing until the very end. Fans of The Dark Knight and other Christopher Nolan films consistently rate this movie highly, with many saying it captures the same intellectual depth and visual storytelling they love."
  }
]

Make the personalizedReason informative and engaging. Include: 1) A brief plot summary, 2) Why it matches their taste based on their ratings, 3) What critics/audiences say about it, 4) A natural sentence about how others who enjoyed similar movies to the user's highly-rated films also loved this movie. Be specific about the movie's content and appeal. Only recommend movies that are well-known and available on major streaming platforms. Do not include any text before or after the JSON array.`,
        },
      ],
      temperature: 0.8,
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
      // First search for the movie to get its ID
      const searchResult = await searchMovieByTitle(aiRec.title);

      if (searchResult) {
        // Then fetch full movie details including revenue using the movie ID
        const fullMovieDetails = await getMovieDetails(searchResult.id);

        if (fullMovieDetails) {
          recommendations.push({
            ...fullMovieDetails, // This includes revenue data
            reason: aiRec.reason,
            personalizedReason: aiRec.personalizedReason,
            matchScore: searchResult.matchScore,
            matchLevel: searchResult.matchLevel,
            enhancedReason: searchResult.enhancedReason,
          });
        } else {
          // Fallback to search result if getMovieDetails fails
          recommendations.push({
            ...searchResult,
            reason: aiRec.reason,
            personalizedReason: aiRec.personalizedReason,
          });
        }
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
