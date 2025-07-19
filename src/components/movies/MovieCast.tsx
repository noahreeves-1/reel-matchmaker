import Image from "next/image";
import { TMDBMovie } from "@/lib/tmdb";
import { getTopCast } from "@/lib/movieUtils";

interface MovieCastProps {
  movie: TMDBMovie;
}

export const MovieCast = ({ movie }: MovieCastProps) => {
  const topCast = getTopCast(movie);

  if (topCast.length === 0) return null;

  return (
    <section>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
        Top Cast
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {topCast.map((actor) => (
          <div
            key={actor.id}
            className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-sm"
          >
            {actor.profile_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                alt={actor.name}
                width={200}
                height={300}
                className="w-full aspect-[2/3] object-cover"
              />
            ) : (
              <div className="w-full aspect-[2/3] bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <span className="text-slate-400 text-sm">No Photo</span>
              </div>
            )}
            <div className="p-3">
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                {actor.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs">
                {actor.character}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
