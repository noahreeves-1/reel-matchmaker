import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserRatings, saveUserRating } from "@/lib/db-utils";

// RENDERING STRATEGY: Server-Side Rendering (SSR) with Real-time Data
// - This API route handles user-specific movie ratings with server-side authentication
// - Uses NextAuth.js server-side session validation for security
// - Benefits: Secure user data access, database persistence, real-time updates
// - Perfect for: User-specific data that requires authentication and database storage
// - Why SSR with auth? User ratings are private data that must be protected
//
// REACT QUERY INTEGRATION:
// - CLIENT-SIDE: React Query handles caching with optimistic updates
// - REAL-TIME: No server-side caching - data must be fresh for user interactions
// - MUTATIONS: Rating changes trigger immediate UI updates with background sync
// - BACKGROUND REFETCH: React Query keeps data fresh with window focus refetch
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

// GET /api/user-ratings - Get all ratings for the current user
export async function GET() {
  try {
    // Server-side authentication using NextAuth.js
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user email from authenticated session
    const userEmail = session.user.email;

    // Fetch user ratings from database using Drizzle ORM
    // React Query will cache this data client-side with real-time updates
    const ratings = await getUserRatings(userEmail);

    return NextResponse.json({
      success: true,
      ratings,
    });
  } catch (error) {
    console.error("Error fetching user ratings:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/user-ratings - Save a new rating or update existing one
export async function POST(request: NextRequest) {
  try {
    // Server-side authentication using NextAuth.js
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { movieId, rating, notes } = body;

    // Input validation for required fields
    if (!movieId || !rating) {
      return NextResponse.json(
        { error: "Movie ID and rating are required" },
        { status: 400 }
      );
    }

    // Rating validation (1-10 scale)
    if (rating < 1 || rating > 10) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 10" },
        { status: 400 }
      );
    }

    const userEmail = session.user.email;

    // Save rating to database using Drizzle ORM
    // React Query will handle optimistic updates and background refetch
    const savedRating = await saveUserRating(userEmail, movieId, rating, notes);

    if (!savedRating) {
      return NextResponse.json(
        { error: "Failed to save rating" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      rating: savedRating,
    });
  } catch (error) {
    console.error("Error saving user rating:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
