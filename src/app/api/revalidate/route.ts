import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// CACHE INVALIDATION API: Manual cache refresh for Next.js
// This route allows manual invalidation of cached data when needed
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Manual control vs. automatic invalidation, potential cache misses
// - VERCEL OPTIMIZATIONS: Selective cache invalidation, minimal performance impact
// - SCALE BREAKERS: Too frequent invalidations, cache stampede
// - FUTURE IMPROVEMENTS: Add rate limiting, automatic invalidation strategies
//
// CURRENT USAGE: Manual cache refresh, data consistency management
// ARCHITECTURE: Client → API Route → Next.js Cache → Invalidation

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

    // Revalidate the specific tag
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

// Optional: GET method to check cache status
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
