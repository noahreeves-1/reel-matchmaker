import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserRecommendations, getLastRecommendations } from "@/lib/db-utils";

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
export async function GET(request: Request) {
  try {
    console.log("🔄 API: /api/recommendations called");

    // Server-side authentication using NextAuth.js
    const session = await auth();
    console.log(
      "🔄 API: Session data:",
      session?.user?.email ? "User authenticated" : "No user"
    );

    if (!session?.user?.email) {
      console.log("❌ API: Unauthorized - no session or email");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;
    console.log("🔄 API: User email:", userEmail);

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const lastOnly = searchParams.get("last") === "true";

    console.log("🔄 API: Query params - limit:", limit, "lastOnly:", lastOnly);

    let recommendations;

    if (lastOnly) {
      // Get only the last N recommendations with movie details
      const limitNumber = limit ? parseInt(limit, 10) : 5;
      console.log("🔄 API: Getting last", limitNumber, "recommendations");
      recommendations = await getLastRecommendations(userEmail, limitNumber);
    } else {
      // Get all recommendations (original behavior)
      console.log("🔄 API: Getting all recommendations");
      recommendations = await getUserRecommendations(userEmail);
    }

    console.log("🔄 API: Found", recommendations.length, "recommendations");

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error("❌ API: Error fetching user recommendations:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
