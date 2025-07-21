import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

// RENDERING STRATEGY: Server-Side Rendering (SSR) with Cache Management
// - This API route provides manual cache invalidation for Next.js ISR and fetch caching
// - Uses Next.js revalidateTag function for selective cache invalidation
// - Benefits: Manual cache control, data consistency, selective invalidation
// - Perfect for: Cache management when data changes need immediate reflection
// - Why SSR with cache management? Cache invalidation must happen server-side
//
// NEXT.JS OPTIMIZATIONS:
// - Selective cache invalidation with revalidateTag
// - Tag-based cache management for granular control
// - Minimal performance impact - only invalidates specific tags
// - GET endpoint for cache status checking
// - Error handling for invalid cache operations
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: Manual control vs. automatic invalidation, potential cache misses
// - VERCEL OPTIMIZATIONS: Selective cache invalidation, minimal performance impact
// - SCALE BREAKERS: Too frequent invalidations, cache stampede
// - FUTURE IMPROVEMENTS: Rate limiting, automatic invalidation strategies
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

    // Revalidate the specific cache tag
    // This triggers regeneration of all cached data with this tag
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

// GET method to check cache status and provide usage information
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
