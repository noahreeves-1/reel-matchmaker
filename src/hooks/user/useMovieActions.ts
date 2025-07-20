import { useLocalStorage, STORAGE_KEYS } from "@/lib";
import { RatedMovie, WantToWatchMovie } from "@/types/movie";
import { TMDBMovie } from "@/lib/tmdb";

// MOVIE ACTIONS HOOK: User interactions with movies
// This hook manages user actions like rating movies and managing watch lists
export const useMovieActions = () => {
  const [ratedMovies, setRatedMovies] = useLocalStorage<RatedMovie[]>(
    STORAGE_KEYS.RATED_MOVIES,
    []
  );

  const [wantToWatchList, setWantToWatchList] = useLocalStorage<
    WantToWatchMovie[]
  >(STORAGE_KEYS.WANT_TO_WATCH, []);

  const rateMovie = (movie: TMDBMovie, rating: number) => {
    const existingIndex = ratedMovies.findIndex((m) => m.id === movie.id);
    const newRatedMovie: RatedMovie = {
      id: movie.id,
      title: movie.title,
      rating,
      ratedAt: new Date().toISOString(),
      release_date: movie.release_date,
    };

    if (existingIndex >= 0) {
      // Update existing rating
      const updated = [...ratedMovies];
      updated[existingIndex] = newRatedMovie;
      setRatedMovies(updated);
    } else {
      // Add new rating
      setRatedMovies([...ratedMovies, newRatedMovie]);
    }
  };

  const removeRating = (movieId: number) => {
    setRatedMovies(ratedMovies.filter((m) => m.id !== movieId));
  };

  const getRating = (movieId: number): number | null => {
    const rated = ratedMovies.find((m) => m.id === movieId);
    return rated ? rated.rating : null;
  };

  const toggleWantToWatch = (movie: TMDBMovie) => {
    const isInList = wantToWatchList.some((m) => m.id === movie.id);

    if (isInList) {
      setWantToWatchList(wantToWatchList.filter((m) => m.id !== movie.id));
    } else {
      const wantToWatchMovie: WantToWatchMovie = {
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path || undefined,
        release_date: movie.release_date,
        addedAt: new Date().toISOString(),
      };
      setWantToWatchList([...wantToWatchList, wantToWatchMovie]);
    }
  };

  const isInWantToWatch = (movieId: number): boolean => {
    return wantToWatchList.some((m) => m.id === movieId);
  };

  return {
    ratedMovies,
    wantToWatchList,
    rateMovie,
    removeRating,
    getRating,
    toggleWantToWatch,
    isInWantToWatch,
  };
};
