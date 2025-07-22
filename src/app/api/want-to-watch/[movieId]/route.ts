import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  removeFromWantToWatch,
  addToWantToWatch,
  isInWantToWatch,
} from "@/lib/db-utils";

// Individual movie want-to-watch API route with dynamic route parameters
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
    const { movieTitle, posterPath, releaseDate } = body;

    const userEmail = session.user.email;

    const addedItem = await addToWantToWatch(
      userEmail,
      movieId,
      1,
      undefined,
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

    const isInList = await isInWantToWatch(userEmail, movieId);

    return NextResponse.json({
      success: true,
      isInWantToWatch: isInList,
    });
  } catch (error) {
    console.error("Error checking want-to-watch status:", error);

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

    const removed = await removeFromWantToWatch(userEmail, movieId);

    if (!removed) {
      return NextResponse.json(
        { error: "Movie not found in want-to-watch list" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Movie removed from want-to-watch list successfully",
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
