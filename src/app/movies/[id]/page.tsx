import { notFound } from "next/navigation";
import { MovieDetailsWithBreadcrumbs } from "@/components/movies";
import { getMovieData } from "@/hooks/server";
import { API_CONFIG, CACHE_CONFIG } from "@/lib/constants";

// RENDERING STRATEGY: ISR (Incremental Static Regeneration)
// - This page is statically generated at build time for maximum performance
// - It's regenerated every 5 minutes to keep movie details fresh
// - Benefits: Fast loading, good SEO, reduced API calls to TMDB
// - Perfect for: Movie details that don't change frequently but need to stay current
// - Why 5 minutes? Movie ratings and popularity change slowly, so frequent updates aren't needed
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: 5-minute stale data, no user-specific content, limited interactivity
// - VERCEL OPTIMIZATIONS: Per-page caching, automatic CDN distribution, serverless functions
// - SCALE BREAKERS: Popular movies causing frequent revalidations, TMDB rate limits
// - FUTURE IMPROVEMENTS: Add user ratings overlay, real-time popularity updates
export const revalidate = CACHE_CONFIG.MOVIES_STALE_TIME / 1000; // Convert to seconds

/**
 * Validates movie ID and fetches movie data
 * Eliminates code duplication between generateMetadata and the main component
 */
const getValidatedMovie = async (params: Promise<{ id: string }>) => {
  const { id } = await params;
  const movieId = parseInt(id);

  if (isNaN(movieId)) {
    return null;
  }

  return await getMovieData(movieId);
};

/**
 * Generates metadata for SEO and social media sharing
 * Next.js automatically calls this function when generating the page
 */
export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const movie = await getValidatedMovie(params);

  if (!movie) {
    return { title: "Movie Not Found - Reel Matchmaker" };
  }

  return {
    title: `${movie.title} - Reel Matchmaker`,
    description: movie.overview,
    // Open Graph tags for social media platforms
    openGraph: {
      title: movie.title,
      description: movie.overview,
      images: movie.poster_path
        ? [`${API_CONFIG.TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`]
        : [],
    },
  };
};

/**
 * Movie detail page component
 * Handles dynamic routes for individual movie pages
 * Uses ISR for optimal performance and SEO
 */
export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const movie = await getValidatedMovie(params);

  if (!movie) {
    notFound();
  }

  return <MovieDetailsWithBreadcrumbs movie={movie} />;
}
