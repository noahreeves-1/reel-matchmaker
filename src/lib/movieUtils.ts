// Helper functions for movie data processing

export const getPosterUrl = (
  posterPath: string | null,
  size: string = "w500"
): string => {
  if (!posterPath) {
    return "/placeholder-poster.jpg";
  }
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
};

export const formatRuntime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
};

export const formatCurrency = (amount: number): string => {
  if (amount === 0) return "Unknown";

  if (amount >= 1000000000) {
    return `$${(amount / 1000000000).toFixed(1)}B`;
  } else if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  } else {
    return `$${amount.toLocaleString()}`;
  }
};

export const getDirectors = (movie: {
  credits?: { crew?: Array<{ job: string; name: string }> };
}): Array<{ name: string }> => {
  if (!movie.credits?.crew) return [];

  return movie.credits.crew
    .filter(
      (person: { job: string; name: string }) => person.job === "Director"
    )
    .map((person: { job: string; name: string }) => ({ name: person.name }));
};

export const getWriters = (movie: {
  credits?: { crew?: Array<{ job: string; name: string }> };
}): Array<{ name: string }> => {
  if (!movie.credits?.crew) return [];

  return movie.credits.crew
    .filter(
      (person: { job: string; name: string }) =>
        person.job === "Writer" ||
        person.job === "Screenplay" ||
        person.job === "Story"
    )
    .map((person: { job: string; name: string }) => ({ name: person.name }));
};

export const getTopCast = (movie: {
  credits?: {
    cast?: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
}): Array<{
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}> => {
  if (!movie.credits?.cast) return [];

  return movie.credits.cast
    .slice(0, 8)
    .map(
      (actor: {
        id: number;
        name: string;
        character: string;
        profile_path: string | null;
      }) => ({
        id: actor.id,
        name: actor.name,
        character: actor.character,
        profile_path: actor.profile_path,
      })
    );
};

export const getTrailers = (movie: {
  videos?: {
    results?: Array<{
      id: string;
      key: string;
      name: string;
      official: boolean;
      type: string;
      site: string;
    }>;
  };
}): Array<{
  id: string;
  key: string;
  name: string;
  official: boolean;
}> => {
  if (!movie.videos?.results) return [];

  return movie.videos.results
    .filter(
      (video: { type: string; site: string }) =>
        video.type === "Trailer" && video.site === "YouTube"
    )
    .slice(0, 6)
    .map(
      (video: {
        id: string;
        key: string;
        name: string;
        official: boolean;
      }) => ({
        id: video.id,
        key: video.key,
        name: video.name,
        official: video.official,
      })
    );
};
