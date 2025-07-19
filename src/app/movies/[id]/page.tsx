import { notFound } from "next/navigation";
import { MovieDetailsWithBreadcrumbs } from "@/components/movies";
import { getMovieData } from "@/hooks/server";

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = parseInt(id);

  if (isNaN(movieId)) {
    return { title: "Movie Not Found - Reel Matchmaker" };
  }

  const movie = await getMovieData(movieId);

  if (!movie) {
    return { title: "Movie Not Found - Reel Matchmaker" };
  }

  return {
    title: `${movie.title} - Reel Matchmaker`,
    description: movie.overview,
    openGraph: {
      title: movie.title,
      description: movie.overview,
      images: movie.poster_path
        ? [`https://image.tmdb.org/t/p/w500${movie.poster_path}`]
        : [],
    },
  };
}

export default async function MoviePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = parseInt(id);

  if (isNaN(movieId)) {
    notFound();
  }

  const movie = await getMovieData(movieId);

  if (!movie) {
    notFound();
  }

  return <MovieDetailsWithBreadcrumbs movie={movie} />;
}
