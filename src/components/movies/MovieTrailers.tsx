import Image from "next/image";
import { TMDBMovie } from "@/lib/tmdb";
import { getTrailers } from "@/lib/movieUtils";

interface MovieTrailersProps {
  movie: TMDBMovie;
}

export const MovieTrailers = ({ movie }: MovieTrailersProps) => {
  const trailers = getTrailers(movie);

  if (trailers.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
        Trailers
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trailers.map((trailer) => (
          <div
            key={trailer.id}
            className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm"
          >
            <div className="aspect-video bg-slate-200 dark:bg-slate-700 relative overflow-hidden">
              <Image
                src={`https://img.youtube.com/vi/${trailer.key}/hqdefault.jpg`}
                alt={trailer.name}
                fill
                className="object-cover"
                loading="lazy"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                onError={(e) => {
                  // Fallback to a placeholder if YouTube thumbnail fails
                  const target = e.target as HTMLImageElement;
                  target.src = "/movie-background-collage.jpg";
                }}
              />
              <div className="absolute inset-0 bg-black/30 hover:bg-black/20 transition-colors" />
              <a
                href={`https://www.youtube.com/watch?v=${trailer.key}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center hover:bg-black/10 transition-colors"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-lg">
                    <svg
                      className="w-8 h-8 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-white drop-shadow-lg">
                    Watch Trailer
                  </p>
                </div>
              </a>
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                {trailer.name}
              </h3>
              {trailer.official && (
                <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full mt-1">
                  Official
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
