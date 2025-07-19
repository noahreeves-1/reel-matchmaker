import { TMDBMovie } from "./tmdb";

export const formatCurrency = (amount: number) => {
  if (!amount) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatRuntime = (minutes: number) => {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

export const getTopCast = (movie: TMDBMovie) => {
  return movie.credits?.cast?.slice(0, 10) || [];
};

export const getDirectors = (movie: TMDBMovie) => {
  return (
    movie.credits?.crew?.filter((person) => person.job === "Director") || []
  );
};

export const getWriters = (movie: TMDBMovie) => {
  return (
    movie.credits?.crew?.filter(
      (person) =>
        person.job === "Screenplay" ||
        person.job === "Writer" ||
        person.job === "Story"
    ) || []
  );
};

export const getTrailers = (movie: TMDBMovie) => {
  return (
    movie.videos?.results
      ?.filter((video) => video.site === "YouTube" && video.type === "Trailer")
      .slice(0, 3) || []
  );
};
