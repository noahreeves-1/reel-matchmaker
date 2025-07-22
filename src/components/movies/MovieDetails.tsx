import Link from "next/link";
import { TMDBMovie } from "@/lib/tmdb";
import { MovieHero } from "./MovieHero";
import { MovieSidebar } from "./MovieSidebar";
import { MovieCast } from "./MovieCast";
import { MovieTrailers } from "./MovieTrailers";
import { formatCurrency, getDirectors, getWriters } from "@/lib/movieUtils";
import { MovieDetailsClient } from "./MovieDetailsClient";

// SERVER COMPONENT: Static movie details content
// This component handles all server-side rendering (SEO, static content)
// No "use client" directive - runs on server
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface MovieDetailsProps {
  movie: TMDBMovie;
  breadcrumbs?: BreadcrumbItem[];
}

export const MovieDetails = ({ movie, breadcrumbs }: MovieDetailsProps) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Breadcrumb Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
            {breadcrumbs ? (
              <>
                {breadcrumbs.map((item, index) => (
                  <li key={index}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="hover:text-slate-900 dark:hover:text-white transition-colors"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <span className="text-slate-900 dark:text-white font-medium">
                        {item.label}
                      </span>
                    )}
                    {index < breadcrumbs.length - 1 && (
                      <span className="text-slate-400 ml-2">/</span>
                    )}
                  </li>
                ))}
              </>
            ) : (
              <>
                <li>
                  <Link
                    href="/"
                    className="hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <span className="text-slate-400 ml-2">/</span>
                </li>
                <li>
                  <Link
                    href="/movies"
                    className="hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Popular Movies
                  </Link>
                </li>
                <li>
                  <span className="text-slate-400 ml-2">/</span>
                </li>
                <li className="text-slate-900 dark:text-white font-medium">
                  {movie.title}
                </li>
              </>
            )}
          </ol>
        </nav>
      </div>

      {/* Movie Hero Section */}
      <MovieHero movie={movie} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <MovieSidebar movie={movie} />

          {/* Right Column - Detailed Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Client component handles all user interactions */}
            <MovieDetailsClient movie={movie} />

            {/* Overview */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                Overview
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                {movie.overview || "No overview available."}
              </p>
            </section>

            {/* Financial Information */}
            {(movie.budget || movie.revenue) && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Financial Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {movie.budget && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Budget
                      </h3>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(movie.budget)}
                      </p>
                    </div>
                  )}
                  {movie.revenue && (
                    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Revenue
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(movie.revenue)}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            <MovieCast movie={movie} />

            {/* Crew */}
            {(getDirectors(movie).length > 0 ||
              getWriters(movie).length > 0) && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Crew
                </h2>
                <div className="space-y-4">
                  {getDirectors(movie).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Director{getDirectors(movie).length > 1 ? "s" : ""}
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300">
                        {getDirectors(movie)
                          .map((director: { name: string }) => director.name)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                  {getWriters(movie).length > 0 && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Writer{getWriters(movie).length > 1 ? "s" : ""}
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300">
                        {getWriters(movie)
                          .map((writer: { name: string }) => writer.name)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}

            <MovieTrailers movie={movie} />

            {/* Production Information */}
            {(movie.production_companies?.length ||
              movie.production_countries?.length ||
              movie.spoken_languages?.length) && (
              <section>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  Production Information
                </h2>
                <div className="space-y-4">
                  {movie.production_companies?.length && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Production Companies
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300">
                        {movie.production_companies
                          .map((company) => company.name)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                  {movie.production_countries?.length && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Production Countries
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300">
                        {movie.production_countries
                          .map((country) => country.name)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                  {movie.spoken_languages?.length && (
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                        Spoken Languages
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300">
                        {movie.spoken_languages
                          .map((lang) => lang.name)
                          .join(", ")}
                      </p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
