import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  removeUserRating,
  saveUserRating,
  getUserRating,
} from "@/lib/db-utils";

// Individual movie ratings API route with dynamic route parameters
// Uses NextAuth.js for security and database persistence for real-time updates

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { movieId: movieIdParam } = await params;
    const movieId = parseInt(movieIdParam);

    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const body = await request.json();

    const { rating, movieTitle, posterPath, releaseDate } = body;

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

    const savedRating = await saveUserRating(
      userEmail,
      movieId,
      ratingNumber,
      undefined,
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { movieId: movieIdParam } = await params;
    const movieId = parseInt(movieIdParam);

    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const userEmail = session.user.email;

    const rating = await getUserRating(userEmail, movieId);

    return NextResponse.json({
      success: true,
      rating,
    });
  } catch (error) {
    console.error("Error fetching rating:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ movieId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { movieId: movieIdParam } = await params;
    const movieId = parseInt(movieIdParam);

    if (isNaN(movieId)) {
      return NextResponse.json({ error: "Invalid movie ID" }, { status: 400 });
    }

    const userEmail = session.user.email;

    const deleted = await removeUserRating(userEmail, movieId);

    if (!deleted) {
      return NextResponse.json(
        { error: "Rating not found or failed to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Rating deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting rating:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
