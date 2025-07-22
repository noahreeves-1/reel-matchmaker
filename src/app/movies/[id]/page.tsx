import { notFound } from "next/navigation";
import { MovieDetailsWithBreadcrumbs } from "@/components/movies";
import { getMovieData } from "@/lib/server-functions";
import { API_CONFIG } from "@/lib/constants";

// RENDERING STRATEGY: ISR (Incremental Static Regeneration) with Static Generation
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
export const revalidate = 300;

/**
 * STATIC GENERATION: Pre-generate popular movie pages at build time
 * This function tells Next.js which movie IDs to pre-generate as static pages
 * Benefits: Faster initial loads for popular movies, better SEO, reduced server load
 *
 * Next.js will:
 * 1. Call this function at build time
 * 2. Pre-generate static HTML for each popular movie
 * 3. Serve these pages instantly from CDN
 * 4. Fall back to on-demand generation for other movies
 */
export async function generateStaticParams() {
  try {
    const apiKey = process.env.TMDB_API_KEY;

    if (!apiKey) {
      console.warn(
        "TMDB API key not available during build, skipping static generation"
      );
      return [];
    }

    // Fetch top 20 popular movies to pre-generate
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}&language=en-US&page=1`,
      {
        headers: { "Content-Type": "application/json" },
        // No caching during build time - we want fresh data
      }
    );

    if (!response.ok) {
      console.warn("Failed to fetch popular movies for static generation");
      return [];
    }

    const data = await response.json();

    // Generate params for top 20 popular movies
    return data.results.slice(0, 20).map((movie: { id: number }) => ({
      id: movie.id.toString(),
    }));
  } catch (error) {
    console.warn("Error generating static params:", error);
    return [];
  }
}

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
