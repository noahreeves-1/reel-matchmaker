import Image from "next/image";
import { TMDBMovie } from "@/lib/tmdb";
import { getBackdropUrl } from "@/lib/tmdb";

interface MovieHeroProps {
  movie: TMDBMovie;
}

export const MovieHero = ({ movie }: MovieHeroProps) => {
  const backdropUrl = getBackdropUrl(movie.backdrop_path, "w1280");

  if (!backdropUrl) return null;

  return (
    <div className="relative h-96 lg:h-[500px] overflow-hidden">
      <Image
        src={backdropUrl}
        alt={movie.title}
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
            {movie.title}
          </h1>
          {movie.tagline && (
            <p className="text-xl text-slate-200 italic mb-4">
              "{movie.tagline}"
            </p>
          )}
          <div className="flex flex-wrap gap-4 text-white">
            {movie.genres?.map((genre) => (
              <span
                key={genre.id}
                className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
              >
                {genre.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
