import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserRecommendations } from "@/lib/db-utils";

// RENDERING STRATEGY: Server-Side Rendering (SSR) with Database Queries
// - This API route retrieves saved recommendations from the database
// - Uses NextAuth.js server-side authentication and database queries
// - Benefits: Fast retrieval of cached recommendations, user-specific data
// - Perfect for: Displaying user's recommendation history and analytics
// - Why SSR with database? Recommendations are user-specific and need to be secure
//
// NEXT.JS OPTIMIZATIONS:
// - Server-side authentication with NextAuth.js
// - Database queries with Drizzle ORM
// - No caching - recommendations are user-specific and real-time
// - Error handling and type safety
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Database queries vs. real-time data accuracy
// - VERCEL OPTIMIZATIONS: Serverless functions, database connection pooling
// - SCALE BREAKERS: Database connection limits, authentication overhead
// - FUTURE IMPROVEMENTS: Redis caching, database indexing, pagination

// GET /api/recommendations - Get user's saved recommendations
export async function GET(request: NextRequest) {
  try {
    // Server-side authentication using NextAuth.js
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;

    // Get user's saved recommendations from database
    const savedRecommendations = await getUserRecommendations(userEmail);

    return NextResponse.json({
      success: true,
      recommendations: savedRecommendations,
      count: savedRecommendations.length,
    });
  } catch (error) {
    console.error("Error fetching user recommendations:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
