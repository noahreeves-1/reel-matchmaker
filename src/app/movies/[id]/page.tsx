import { notFound } from "next/navigation";
import { MovieCard } from "@/components/movies";
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
    return { title: "Movie Not Found - ReelTaste" };
  }

  const movie = await getMovieData(movieId);

  if (!movie) {
    return { title: "Movie Not Found - ReelTaste" };
  }

  return {
    title: `${movie.title} - ReelTaste`,
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3">
          <MovieCard movie={movie} />
        </div>

        <div className="lg:w-2/3">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            {movie.title}
          </h1>

          <div className="text-slate-600 dark:text-slate-400 mb-6">
            <p className="text-lg">{movie.overview}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold">Release Date:</span>
              <p>{new Date(movie.release_date).toLocaleDateString()}</p>
            </div>
            <div>
              <span className="font-semibold">Rating:</span>
              <p>{movie.vote_average.toFixed(1)}/10</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
