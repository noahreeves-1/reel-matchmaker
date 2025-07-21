import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { removeUserRating, saveUserRating } from "@/lib/db-utils";

// RENDERING STRATEGY: Server-Side Rendering (SSR) with Dynamic Routes
// - This API route handles individual movie ratings with dynamic route parameters
// - Uses NextAuth.js server-side authentication and dynamic parameter validation
// - Benefits: Secure per-movie operations, database persistence, real-time updates
// - Perfect for: Individual movie rating operations (rate, get, delete)
// - Why SSR with dynamic routes? Each movie rating operation is user-specific and secure
//
// NEXT.JS OPTIMIZATIONS:
// - Dynamic route parameter handling with proper validation
// - Server-side authentication with NextAuth.js
// - Database operations with Drizzle ORM
// - Input validation and type conversion
// - No caching - user data must be real-time
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Database queries vs. real-time data accuracy
// - VERCEL OPTIMIZATIONS: Serverless functions, database connection pooling
// - SCALE BREAKERS: Database connection limits, authentication overhead
// - FUTURE IMPROVEMENTS: Redis caching, database indexing, batch operations

// POST /api/user-ratings/[movieId] - Rate a movie
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  try {
    // Server-side authentication using NextAuth.js
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Dynamic route parameter extraction and validation
    const { movieId: movieIdParam } = await params;
    const movieId = parseInt(movieIdParam);

    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const body = await request.json();

    const { rating, movieTitle, posterPath, releaseDate } = body;

    // Convert rating to number and validate
    const ratingNumber = Number(rating);

    if (
      !ratingNumber ||
      ratingNumber < 1 ||
      ratingNumber > 10 ||
      isNaN(ratingNumber)
    ) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 10" },
        { status: 400 }
      );
    }

    const userEmail = session.user.email;

    // Save rating to database with movie metadata
    const savedRating = await saveUserRating(
      userEmail,
      movieId,
      ratingNumber,
      undefined, // no notes
      movieTitle,
      posterPath,
      releaseDate
    );

    if (!savedRating) {
      return NextResponse.json(
        { error: "Failed to save rating" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Rating saved successfully",
      rating: savedRating,
    });
  } catch (error) {
    console.error("Error saving rating:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET /api/user-ratings/[movieId] - Get a specific rating
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  try {
    // Server-side authentication using NextAuth.js
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Dynamic route parameter extraction and validation
    const { movieId: movieIdParam } = await params;
    const movieId = parseInt(movieIdParam);

    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const userEmail = session.user.email;

    // Dynamic import for database utility function
    const { getUserRating } = await import("@/lib/db-utils");
    const rating = await getUserRating(userEmail, movieId);

    if (!rating) {
      return NextResponse.json({ error: "Rating not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      rating: rating.rating,
    });
  } catch (error) {
    console.error("Error getting rating:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/user-ratings/[movieId] - Remove a specific rating
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  try {
    // Server-side authentication using NextAuth.js
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Dynamic route parameter extraction and validation
    const { movieId: movieIdParam } = await params;
    const movieId = parseInt(movieIdParam);

    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const userEmail = session.user.email;

    // Remove rating from database
    const removedRating = await removeUserRating(userEmail, movieId);

    if (!removedRating) {
      return NextResponse.json({ error: "Rating not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Rating removed successfully",
      removedRating,
    });
  } catch (error) {
    console.error("Error removing rating:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
