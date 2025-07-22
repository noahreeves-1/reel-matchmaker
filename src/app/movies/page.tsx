import { Suspense } from "react";
import { MovieGrid } from "@/components/movies";
import {
  LoadingSkeleton,
  Breadcrumb,
  PageHeader,
  PageContainer,
} from "@/components/common";
import { getInitialMovies } from "@/lib/server-functions";

// ISR (Incremental Static Regeneration) page for popular movies
// Statically generated at build time, regenerated every hour for freshness

export const revalidate = 3600;

export const metadata = {
  title: "Popular Movies - Reel Matchmaker",
  description: "Discover the most popular movies trending right now",
  keywords: ["movies", "popular", "trending", "TMDB", "streaming"],
};

export default async function MoviesPage() {
  const movies = await getInitialMovies();

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Popular Movies" },
  ];

  return (
    <PageContainer>
      <Breadcrumb items={breadcrumbItems} />

      <PageHeader
        title="Popular Movies"
        description="Discover the most popular movies trending right now"
      />

      <Suspense fallback={<LoadingSkeleton />}>
        <MovieGrid movies={movies.results} isLoading={false} />
      </Suspense>
    </PageContainer>
  );
}
