import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWantToWatchList, addToWantToWatch } from "@/lib/db-utils";

// RENDERING STRATEGY: Server-Side Rendering (SSR) with Authentication
// - This API route handles user's want-to-watch list with server-side authentication
// - Uses NextAuth.js server-side session validation for security
// - Benefits: Secure user data access, database persistence, real-time updates
// - Perfect for: User-specific watch list data that requires authentication
// - Why SSR with auth? Watch lists are private user data that must be protected
//
// NEXT.JS OPTIMIZATIONS:
// - Server-side authentication with NextAuth.js
// - Database queries with Drizzle ORM for type safety
// - Input validation and error handling
// - No caching - user data must be real-time
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Database queries vs. real-time data accuracy
// - VERCEL OPTIMIZATIONS: Serverless functions, database connection pooling
// - SCALE BREAKERS: Database connection limits, authentication overhead
// - FUTURE IMPROVEMENTS: Redis caching, database indexing, connection pooling

// GET /api/want-to-watch - Get all want-to-watch items for the current user
export async function GET() {
  try {
    // Server-side authentication using NextAuth.js
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;

    // Fetch user's want-to-watch list from database
    const wantToWatchItems = await getWantToWatchList(userEmail);

    return NextResponse.json({
      success: true,
      wantToWatch: wantToWatchItems,
    });
  } catch (error) {
    console.error("Error fetching want-to-watch list:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/want-to-watch - Add a movie to want-to-watch list
export async function POST(request: NextRequest) {
  try {
    // Server-side authentication using NextAuth.js
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { movieId, priority, notes, movieTitle, posterPath, releaseDate } =
      body;

    // Input validation for required fields
    if (!movieId) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 }
      );
    }

    // Priority validation (1-5 scale, optional)
    if (priority && (priority < 1 || priority > 5)) {
      return NextResponse.json(
        { error: "Priority must be between 1 and 5" },
        { status: 400 }
      );
    }

    const userEmail = session.user.email;

    // Add movie to user's want-to-watch list in database
    const addedItem = await addToWantToWatch(
      userEmail,
      movieId,
      priority,
      notes,
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
