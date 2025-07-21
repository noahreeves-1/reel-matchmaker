import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { removeFromWantToWatch, addToWantToWatch } from "@/lib/db-utils";

// POST /api/want-to-watch/[movieId] - Add a movie to want-to-watch list
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
    const { movieTitle, posterPath, releaseDate } = body;

    const userEmail = session.user.email;
    const addedItem = await addToWantToWatch(
      userEmail,
      movieId,
      1, // default priority
      undefined, // no notes
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

// GET /api/want-to-watch/[movieId] - Check if a movie is in want-to-watch list
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

    // Get user by email first
    const { getUserByEmail, isInWantToWatch } = await import("@/lib/db-utils");
    const user = await getUserByEmail(userEmail);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if movie is in want-to-watch list
    const isInList = await isInWantToWatch(user.id, movieId);

    if (!isInList) {
      return NextResponse.json(
        { error: "Movie not found in want-to-watch list" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Movie is in want-to-watch list",
      movieId,
    });
  } catch (error) {
    console.error("Error checking want-to-watch:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE /api/want-to-watch/[movieId] - Remove a movie from want-to-watch list
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
    const removedItem = await removeFromWantToWatch(userEmail, movieId);

    if (!removedItem) {
      return NextResponse.json(
        { error: "Movie not found in want-to-watch list" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Movie removed from want-to-watch list successfully",
      removedItem,
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
