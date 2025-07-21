import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { removeFromWantToWatch, addToWantToWatch } from "@/lib/db-utils";

// RENDERING STRATEGY: Server-Side Rendering (SSR) with Dynamic Routes
// - This API route handles individual movie want-to-watch operations with dynamic parameters
// - Uses NextAuth.js server-side authentication and dynamic parameter validation
// - Benefits: Secure per-movie operations, database persistence, real-time updates
// - Perfect for: Individual movie watch list operations (add, check, remove)
// - Why SSR with dynamic routes? Each watch list operation is user-specific and secure
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

// POST /api/want-to-watch/[movieId] - Add a movie to want-to-watch list
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
    const { movieTitle, posterPath, releaseDate } = body;

    const userEmail = session.user.email;

    // Add movie to user's want-to-watch list with default priority
    const addedItem = await addToWantToWatch(
      userEmail,
      movieId,
      1, // default priority
      undefined, // no notes
      movieTitle,
      posterPath,
      releaseDate
    );

    if (!addedItem) {
      return NextResponse.json(
        { error: "Failed to add to want-to-watch list" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Movie added to want-to-watch list successfully",
      wantToWatchItem: addedItem,
    });
  } catch (error) {
    console.error("Error adding to want-to-watch:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET /api/want-to-watch/[movieId] - Check if a movie is in want-to-watch list
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

    // Dynamic import for database utility functions
    const { getUserByEmail, isInWantToWatch } = await import("@/lib/db-utils");
    const user = await getUserByEmail(userEmail);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if movie is in user's want-to-watch list
    const isInList = await isInWantToWatch(user.id, movieId);

    if (!isInList) {
      return NextResponse.json(
        { error: "Movie not found in want-to-watch list" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Movie is in want-to-watch list",
      movieId,
    });
  } catch (error) {
    console.error("Error checking want-to-watch:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/want-to-watch/[movieId] - Remove a movie from want-to-watch list
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

    // Remove movie from user's want-to-watch list
    const removedItem = await removeFromWantToWatch(userEmail, movieId);

    if (!removedItem) {
      return NextResponse.json(
        { error: "Movie not found in want-to-watch list" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Movie removed from want-to-watch list successfully",
      removedItem,
    });
  } catch (error) {
    console.error("Error removing from want-to-watch:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
