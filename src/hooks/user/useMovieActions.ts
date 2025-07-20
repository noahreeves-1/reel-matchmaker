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

    // Remove from want-to-watch list if it was there
    // This ensures that once a user rates a movie, it's considered "watched"
    // and should be removed from their want-to-watch list
    const isInWantToWatch = wantToWatchList.some((m) => m.id === movie.id);
    if (isInWantToWatch) {
      setWantToWatchList(wantToWatchList.filter((m) => m.id !== movie.id));
    }
  };

  const removeRating = (movieId: number) => {
    setRatedMovies(ratedMovies.filter((m) => m.id !== movieId));

    // Note: We don't automatically add back to want-to-watch list when removing a rating
    // This is a design decision - if a user removes their rating, they might want to
    // re-evaluate the movie, but we don't assume they want to watch it again
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
