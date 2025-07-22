import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserRecommendations, getLastRecommendations } from "@/lib/db-utils";

// User recommendations API route with database queries
// Uses server-side authentication and database queries for user-specific data

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;

    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit");
    const lastOnly = searchParams.get("last") === "true";

    let recommendations;

    if (lastOnly) {
      const limitNumber = limit ? parseInt(limit, 10) : 5;
      recommendations = await getLastRecommendations(userEmail, limitNumber);
    } else {
      recommendations = await getUserRecommendations(userEmail);
    }

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
