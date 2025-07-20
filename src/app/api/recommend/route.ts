import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { RatedMovie, WantToWatchMovie } from "@/types/movie";

// RECOMMENDATION API: AI-powered movie recommendations
// This API route generates personalized movie recommendations using OpenAI
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: High latency (AI processing), expensive API calls, no caching
// - VERCEL OPTIMIZATIONS: Edge functions, automatic scaling, global distribution
// - SCALE BREAKERS: OpenAI rate limits, high costs, slow response times
// - FUTURE IMPROVEMENTS: Add recommendation caching, batch processing, cost optimization

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Movie interface for TMDB API responses
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

// Recommendation interface for enhanced movie data
interface Recommendation extends TMDBMovie {
  reason: string;
  personalizedReason: string;
  matchScore?: number;
  matchLevel?: "LOVE IT" | "LIKE IT" | "MAYBE" | "RISKY";
  enhancedReason?: string;
}

// Extended RatedMovie interface for API usage
interface ExtendedRatedMovie extends RatedMovie {
  title: string;
  release_date?: string;
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

// Function to get full movie details from TMDB
async function getMovieDetails(movieId: number): Promise<TMDBMovie | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("TMDB API key not available for movie details");
    return null;
  }

  try {
    // External API Call: This runs on the server, so it's secure
    // The API key is never exposed to the client
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${apiKey}&language=en-US`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `TMDB details failed for movie ${movieId}:`,
        response.status
      );
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching movie details for ${movieId}:`, error);
    return null;
  }
}

// Function to search for movie by title and get its details
async function searchMovieByTitle(
  title: string
): Promise<Recommendation | null> {
  const apiKey = getApiKey();
  if (!apiKey) {
    console.warn("TMDB API key not available for movie search");
    return null;
  }

  // Extract just the movie title if it includes a year in parentheses
  const cleanTitle = title.replace(/\s*\(\d{4}\)\s*$/, "").trim();
  console.log(`🔍 API: Searching for "${cleanTitle}" (original: "${title}")`);

  try {
    // External API Call: This runs on the server, so it's secure
    // The API key is never exposed to the client
    const encodedQuery = encodeURIComponent(cleanTitle);
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${apiKey}&language=en-US&query=${encodedQuery}&page=1`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(`TMDB search failed for "${title}":`, response.status);
      return null;
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const movie = data.results[0]; // Get the first (most relevant) result

      // Get full movie details including revenue, vote counts, etc.
      const fullDetails = await getMovieDetails(movie.id);

      return {
        id: movie.id,
        title: movie.title,
        reason: "", // Will be filled in by the calling function
        personalizedReason: "", // Will be filled in by the calling function
        poster_path: movie.poster_path,
        release_date: movie.release_date,
        vote_average: fullDetails?.vote_average || movie.vote_average,
        vote_count: fullDetails?.vote_count || movie.vote_count,
        revenue: fullDetails?.revenue,
        popularity: fullDetails?.popularity || movie.popularity,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error searching for movie "${title}":`, error);
    return null;
  }
}

// Function to calculate match score and level based on user preferences
function calculateMatchScore(
  movie: TMDBMovie,
  _ratedMovies: RatedMovie[]
): { score: number; level: "LOVE IT" | "LIKE IT" | "MAYBE" | "RISKY" } {
  // Simple scoring algorithm - can be enhanced later
  let score = 50; // Base score

  // Boost for high TMDB rating
  if (movie.vote_average && movie.vote_average >= 7.5) {
    score += 20;
  } else if (movie.vote_average && movie.vote_average >= 7.0) {
    score += 10;
  }

  // Boost for high vote count (popularity)
  if (movie.vote_count && movie.vote_count >= 10000) {
    score += 15;
  } else if (movie.vote_count && movie.vote_count >= 1000) {
    score += 5;
  }

  // Boost for box office success
  if (movie.revenue && movie.revenue >= 100000000) {
    // $100M+
    score += 10;
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Determine level
  let level: "LOVE IT" | "LIKE IT" | "MAYBE" | "RISKY";
  if (score >= 90) level = "LOVE IT";
  else if (score >= 70) level = "LIKE IT";
  else if (score >= 50) level = "MAYBE";
  else level = "RISKY";

  return { score, level };
}

// AI recommendation interface for parsing OpenAI response
interface AIRecommendation {
  title: string;
  reason: string;
  personalizedReason: string;
}

// Function to create enhanced reason with social proof
function createEnhancedReason(
  movie: TMDBMovie & { personalizedReason?: string },
  matchLevel: string,
  _matchScore: number,
  _ratedMovies: RatedMovie[]
): string {
  const voteCount = movie.vote_count
    ? `${(movie.vote_count / 1000).toFixed(0)}K+`
    : "";
  const revenue = movie.revenue
    ? movie.revenue >= 1000000000
      ? `$${(movie.revenue / 1000000000).toFixed(1)}B`
      : `$${(movie.revenue / 1000000).toFixed(0)}M`
    : "";

  let reason = `**Why you'll ${matchLevel
    .toLowerCase()
    .replace(" ", " ")} it:** `;

  // Create compelling reason based on available data
  if (movie.vote_average && movie.vote_average >= 8.0) {
    reason += `This is a critically acclaimed masterpiece with ${movie.vote_average.toFixed(
      1
    )}/10 from ${voteCount} TMDB voters`;
  } else if (movie.vote_average && movie.vote_average >= 7.5) {
    reason += `A highly-rated film with ${movie.vote_average.toFixed(
      1
    )}/10 from ${voteCount} voters`;
  } else if (movie.vote_average && movie.vote_average >= 7.0) {
    reason += `A solid ${movie.vote_average.toFixed(
      1
    )}/10 rating from ${voteCount} TMDB users`;
  } else {
    reason += `A film with ${
      movie.vote_average?.toFixed(1) || "N/A"
    }/10 rating`;
  }

  if (revenue && movie.revenue && movie.revenue >= 100000000) {
    reason += ` and it was a massive ${revenue} global hit`;
  } else if (revenue && movie.revenue && movie.revenue >= 50000000) {
    reason += ` and it performed well at the box office (${revenue})`;
  }

  // Add the AI-generated personalized reason
  reason += `. ${movie.personalizedReason || ""}`;

  return reason;
}

export async function POST(req: Request) {
  console.log("🤖 API: Recommendation request received");

  try {
    const body = await req.json();
    console.log(
      "📥 API: Request body received:",
      JSON.stringify(body, null, 2)
    );

    const {
      ratedMovies,
      wantToWatchList = [],
    }: { ratedMovies: RatedMovie[]; wantToWatchList?: WantToWatchMovie[] } =
      body;

    if (!ratedMovies || ratedMovies.length === 0) {
      console.log("❌ API: No rated movies provided");
      return new Response(
        JSON.stringify({ error: "No rated movies provided" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("📊 API: Total rated movies:", ratedMovies.length);
    console.log("📊 API: Rated movies:", ratedMovies);
    console.log("💝 API: Want to watch movies:", wantToWatchList);
    console.log(
      "📊 API: Rated movies titles:",
      ratedMovies.map((m) => m.title)
    );

    // Filter to only include movies rated 7+ (liked movies)
    const likedMovies = ratedMovies.filter((movie) => movie.rating >= 7);
    console.log("👍 API: Liked movies (7+):", likedMovies.length);
    console.log("👍 API: Liked movies:", likedMovies);

    if (likedMovies.length === 0) {
      console.log("❌ API: No highly rated movies found");
      return new Response(
        JSON.stringify({
          error:
            "No highly rated movies found. Please rate some movies 7+ to get recommendations.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create a set of all rated movie titles with years for filtering
    const ratedMovieKeys = new Set(
      ratedMovies.map((movie) => {
        const year = movie.release_date
          ? new Date(movie.release_date).getFullYear()
          : "Unknown";
        return `${movie.title.toLowerCase().trim()} (${year})`;
      })
    );

    // Create a set of all want to watch movie titles with years for filtering
    const wantToWatchKeys = new Set(
      wantToWatchList.map((movie: WantToWatchMovie) => {
        const year = movie.release_date
          ? new Date(movie.release_date).getFullYear()
          : "Unknown";
        return `${movie.title.toLowerCase().trim()} (${year})`;
      })
    );

    console.log("📋 API: Rated movie keys:", Array.from(ratedMovieKeys));
    console.log(
      "💝 API: Want to watch movie keys:",
      Array.from(wantToWatchKeys)
    );

    // Create prompt for AI recommendations - include ALL rated movies, not just liked ones
    const allRatedMoviesList = ratedMovies
      .map((movie) => `${movie.title} - (${movie.rating}/10)`)
      .join(", ");

    const wantToWatchMoviesList = wantToWatchList
      .map((movie: WantToWatchMovie) => movie.title)
      .join(", ");

    console.log("🎬 API: All rated movies for AI prompt:", allRatedMoviesList);
    console.log(
      "💝 API: Want to watch movies for AI prompt:",
      wantToWatchMoviesList
    );
    console.log("🤖 API: Calling OpenAI with prompt...");

    // External API Call: This runs on the server, so it's secure
    // The API key is never exposed to the client
    const { text } = await generateText({
      model: openai("gpt-4"),
      messages: [
        {
          role: "system",
          content:
            "You are a movie recommendation expert with a fun, creative personality. Provide accurate, helpful movie recommendations based on user preferences. You MUST always respond with valid JSON in the exact format specified. Do not include any additional text, explanations, or markdown formatting - only the JSON array.",
        },
        {
          role: "user",
          content: `Based on these movies the user rated highly (7+ stars): ${likedMovies
            .map((movie) => `${movie.title} - (${movie.rating}/10)`)
            .join(", ")}

The user has also rated these other movies: ${ratedMovies
            .filter((movie) => movie.rating < 7)
            .map((movie) => `${movie.title} - (${movie.rating}/10)`)
            .join(", ")}

The user has these movies in their want to watch list (movies they want to see): ${
            wantToWatchMoviesList || "None"
          }

Please recommend 5 movies that the user would likely enjoy. For each recommendation, provide:
1. The exact movie title (including the year if there are multiple movies with the same title)
2. A brief reason why you're recommending it (1-2 sentences)
3. A detailed, personalized reason that includes: what the movie is about, why it's interesting based on their taste, and what audiences/critics think about it (3-4 sentences)

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
    "personalizedReason": "This gripping psychological thriller follows a detective's descent into madness as he investigates a series of increasingly disturbing crimes. Given your love for complex character studies like The Dark Knight (10/10), you'll appreciate how this film explores the blurred lines between justice and obsession. Critics praised its atmospheric tension and mind-bending plot twists, with audiences calling it 'a masterclass in psychological suspense' that keeps you guessing until the very end."
  }
]

Make the personalizedReason informative and engaging. Include: 1) A brief plot summary, 2) Why it matches their taste based on their ratings, 3) What critics/audiences say about it. Be specific about the movie's content and appeal. Only recommend movies that are well-known and available on major streaming platforms. Do not include any text before or after the JSON array.`,
        },
      ],
      temperature: 0.8,
      maxTokens: 800,
    });

    console.log("✅ API: OpenAI response received");
    console.log("📝 API: Raw AI response:", text);
    console.log("📝 API: Raw AI response length:", text.length);
    console.log("📝 API: Raw AI response type:", typeof text);

    // Parse the JSON response from the AI
    let aiRecommendations;
    try {
      aiRecommendations = JSON.parse(text);
      console.log("✅ API: Successfully parsed AI response");
      console.log("🎯 API: Parsed recommendations:", aiRecommendations);
      console.log(
        "🎯 API: Parsed recommendations type:",
        typeof aiRecommendations
      );
      console.log("🎯 API: Is array?", Array.isArray(aiRecommendations));

      // Debug: Check if personalizedReason is present
      aiRecommendations.forEach((rec: AIRecommendation, index: number) => {
        console.log(`🎯 API: Recommendation ${index + 1}:`, {
          title: rec.title,
          hasReason: !!rec.reason,
          hasPersonalizedReason: !!rec.personalizedReason,
          personalizedReason: rec.personalizedReason,
        });
      });
    } catch (parseError) {
      console.error("❌ API: Failed to parse AI response:", text);
      console.error("❌ API: Parse error:", parseError);
      throw new Error("Invalid response format from AI");
    }

    // Validate that aiRecommendations is an array
    if (!Array.isArray(aiRecommendations)) {
      console.error("❌ API: AI response is not an array:", aiRecommendations);
      console.error("❌ API: AI response type:", typeof aiRecommendations);
      throw new Error("AI response is not in the expected array format");
    }

    // Search for movie details for each recommendation
    console.log("🔍 API: Searching for movie details...");
    const recommendations: Recommendation[] = [];

    for (const aiRec of aiRecommendations as AIRecommendation[]) {
      // Validate each recommendation has the required fields
      if (!aiRec.title || !aiRec.reason || !aiRec.personalizedReason) {
        console.warn("⚠️ API: Skipping invalid recommendation:", aiRec);
        continue;
      }

      const movieDetails = await searchMovieByTitle(aiRec.title);
      if (movieDetails) {
        // Check the movie details title and year against rated movies AND wish list
        const movieYear = movieDetails.release_date
          ? new Date(movieDetails.release_date).getFullYear()
          : "Unknown";
        const movieKey = `${movieDetails.title
          .toLowerCase()
          .trim()} (${movieYear})`;

        // Skip if this movie is already rated or in want to watch list
        if (ratedMovieKeys.has(movieKey) || wantToWatchKeys.has(movieKey)) {
          console.log(
            `⚠️ API: Skipping ${movieKey} - already rated or in want to watch list`
          );
          continue;
        }

        // Calculate match score and level
        const { score, level } = calculateMatchScore(movieDetails, ratedMovies);

        // Create enhanced reason with social proof
        const enhancedReason = createEnhancedReason(
          movieDetails,
          level,
          score,
          ratedMovies
        );

        recommendations.push({
          ...movieDetails,
          reason: aiRec.reason,
          personalizedReason: aiRec.personalizedReason,
          matchScore: score,
          matchLevel: level,
          enhancedReason,
        });
      }
    }

    console.log("✅ API: Final recommendations:", recommendations);
    console.log("✅ API: Final recommendations count:", recommendations.length);

    return new Response(JSON.stringify(recommendations), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("❌ API: Error in recommendation generation:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate recommendations",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
