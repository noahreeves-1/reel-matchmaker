import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getUserRatings, saveUserRating } from "@/lib/db-utils";

// GET /api/user-ratings - Get all ratings for the current user
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID from session (you might need to adjust this based on your auth setup)
    const userEmail = session.user.email;

    // For now, we'll need to get the user ID from the database
    // In a real app, you'd store the user ID in the session
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
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { movieId, rating, notes } = body;

    if (!movieId || !rating) {
      return NextResponse.json(
        { error: "Movie ID and rating are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 10) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 10" },
        { status: 400 }
      );
    }

    const userEmail = session.user.email;
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
