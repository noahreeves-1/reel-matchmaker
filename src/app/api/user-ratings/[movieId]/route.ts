import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { removeUserRating, saveUserRating } from "@/lib/db-utils";

// POST /api/user-ratings/[movieId] - Rate a movie
export async function POST(
  request: NextRequest,
  { params }: { params: { movieId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const movieId = parseInt(params.movieId);

    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const body = await request.json();
    console.log("Received rating request body:", body);

    const { rating, movieTitle, posterPath, releaseDate } = body;
    console.log("Extracted rating:", rating, "Type:", typeof rating);

    // Convert rating to number and validate
    const ratingNumber = Number(rating);
    console.log(
      "Converted rating number:",
      ratingNumber,
      "Is NaN:",
      isNaN(ratingNumber)
    );

    if (
      !ratingNumber ||
      ratingNumber < 1 ||
      ratingNumber > 10 ||
      isNaN(ratingNumber)
    ) {
      console.error("Invalid rating:", { rating, ratingNumber, body });
      return NextResponse.json(
        { error: "Rating must be between 1 and 10" },
        { status: 400 }
      );
    }

    const userEmail = session.user.email;
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
  { params }: { params: { movieId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const movieId = parseInt(params.movieId);

    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const userEmail = session.user.email;
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
  { params }: { params: { movieId: string } }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const movieId = parseInt(params.movieId);

    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const userEmail = session.user.email;
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
