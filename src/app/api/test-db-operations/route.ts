import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  saveUserRating,
  getUserRatings,
  addToWantToWatch,
  getWantToWatchList,
} from "@/lib/db-utils";

// GET /api/test-db-operations - Test database operations
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;

    // Test getting ratings
    const ratings = await getUserRatings(userEmail);

    // Test getting want-to-watch list
    const wantToWatch = await getWantToWatchList(userEmail);

    return NextResponse.json({
      success: true,
      message: "Database operations test successful",
      userEmail,
      ratings: {
        count: ratings.length,
        data: ratings,
      },
      wantToWatch: {
        count: wantToWatch.length,
        data: wantToWatch,
      },
    });
  } catch (error) {
    console.error("Database operations test failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database operations test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// POST /api/test-db-operations - Test creating data
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { operation, movieId, rating, priority } = body;

    const userEmail = session.user.email;
    let result;

    switch (operation) {
      case "rate":
        if (!movieId || !rating) {
          return NextResponse.json(
            { error: "Movie ID and rating required for rating operation" },
            { status: 400 }
          );
        }
        result = await saveUserRating(userEmail, movieId, rating);
        break;

      case "want-to-watch":
        if (!movieId) {
          return NextResponse.json(
            { error: "Movie ID required for want-to-watch operation" },
            { status: 400 }
          );
        }
        result = await addToWantToWatch(userEmail, movieId, priority);
        break;

      default:
        return NextResponse.json(
          { error: "Invalid operation. Use 'rate' or 'want-to-watch'" },
          { status: 400 }
        );
    }

    if (!result) {
      return NextResponse.json({ error: "Operation failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `${operation} operation successful`,
      result,
    });
  } catch (error) {
    console.error("Test operation failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Test operation failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
