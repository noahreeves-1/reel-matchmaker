import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWantToWatchList, addToWantToWatch } from "@/lib/db-utils";

// Want-to-watch list API route with server-side authentication
// Uses NextAuth.js for security and database persistence for real-time updates

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email;

    const wantToWatchItems = await getWantToWatchList(userEmail);

    return NextResponse.json({
      success: true,
      wantToWatch: wantToWatchItems,
    });
  } catch (error) {
    console.error("Error fetching want-to-watch list:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { movieId, priority, notes, movieTitle, posterPath, releaseDate } =
      body;

    if (!movieId) {
      return NextResponse.json(
        { error: "Movie ID is required" },
        { status: 400 }
      );
    }

    if (priority && (priority < 1 || priority > 5)) {
      return NextResponse.json(
        { error: "Priority must be between 1 and 5" },
        { status: 400 }
      );
    }

    const userEmail = session.user.email;

    const addedItem = await addToWantToWatch(
      userEmail,
      movieId,
      priority,
      notes,
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
      message: "Added to want-to-watch list successfully",
      item: addedItem,
    });
  } catch (error) {
    console.error("Error adding to want-to-watch list:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
