import { Suspense } from "react";
import Link from "next/link";
import { unstable_noStore } from "next/cache";
import { getInitialGenres, getMoviesByGenreData } from "@/lib/server-functions";
import {
  Breadcrumb,
  PageHeader,
  PageContainer,
  LoadingSkeleton,
} from "@/components/common";
import { GenreMovieApp } from "@/components/movies";
import { GenresPageTracker } from "@/components/movies/GenresPageTracker";

// Partial Prerendering (PPR) page with static shell and dynamic holes
// Static shell: Genre grid layout, navigation, loading states
// Dynamic holes: Popular movies from each genre stream in parallel

export const experimental_ppr = true;

export const metadata = {
  title: "Movie Genres - Reel Matchmaker",
  description:
    "Explore movies by genre - Action, Comedy, Drama, Horror, and more",
  keywords: ["movies", "genres", "action", "comedy", "drama", "horror", "TMDB"],
};

export default async function GenresPage() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Genres" }];

  return (
    <PageContainer>
      <GenresPageTracker />

      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="Movie Genres"
        description="Explore movies by genre - discover your next favorite film"
      />

      <div className="mb-12">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Browse by Genre
        </h2>
        <Suspense fallback={<GenreGridSkeleton />}>
          <GenreGrid />
        </Suspense>
      </div>

      <div className="space-y-12">
        <Suspense fallback={<LoadingSkeleton />}>
          <PopularMoviesByGenre genreId={28} genreName="Action" />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton />}>
          <PopularMoviesByGenre genreId={35} genreName="Comedy" />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton />}>
          <PopularMoviesByGenre genreId={18} genreName="Drama" />
        </Suspense>

        <Suspense fallback={<LoadingSkeleton />}>
          <PopularMoviesByGenre genreId={27} genreName="Horror" />
        </Suspense>
      </div>
    </PageContainer>
  );
}

async function GenreGrid() {
  unstable_noStore();

  const genresData = await getInitialGenres();
  const genres = genresData.genres || [];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {genres.map((genre) => (
        <Link
          key={genre.id}
          href={`/genres/${genre.id}`}
          className="group bg-white dark:bg-slate-800 rounded-lg p-4 text-center shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-200 hover:scale-105"
        >
          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {genre.name}
          </h3>
        </Link>
      ))}
    </div>
  );
}

async function PopularMoviesByGenre({
  genreId,
  genreName,
}: {
  genreId: number;
  genreName: string;
}) {
  unstable_noStore();

  const moviesData = await getMoviesByGenreData(genreId, 1);
  const movies = moviesData.results?.slice(0, 6) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Popular {genreName} Movies
        </h2>
        <Link
          href={`/genres/${genreId}`}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          View all {genreName} movies →
        </Link>
      </div>
      <GenreMovieApp movies={movies} />
    </div>
  );
}

function GenreGridSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center shadow-sm border border-slate-200 dark:border-slate-700 animate-pulse"
        >
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
      ))}
    </div>
  );
}
