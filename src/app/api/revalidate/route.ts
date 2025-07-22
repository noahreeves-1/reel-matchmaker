import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// Cache invalidation API route for Next.js ISR and fetch caching
// Uses selective cache invalidation with revalidateTag for granular control

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");

    if (!tag) {
      return NextResponse.json(
        { error: "Tag parameter is required" },
        { status: 400 }
      );
    }

    revalidateTag(tag);

    return NextResponse.json({
      success: true,
      message: `Cache invalidated for tag: ${tag}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error invalidating cache:", error);

    return NextResponse.json(
      {
        error: "Failed to invalidate cache",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");

  return NextResponse.json({
    message: "Cache invalidation endpoint",
    usage: "POST /api/revalidate?tag=your-tag",
    currentTag: tag || "none",
    timestamp: new Date().toISOString(),
  });
}
