// MOVIE UTILITIES: Helper functions for movie data processing
// This file provides utility functions for working with movie data

/**
 * Format movie release date for display
 */
export const formatReleaseDate = (dateString: string): string => {
  if (!dateString) return "Unknown";

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "Unknown";
  }
};

/**
 * Get movie poster URL with fallback
 */
export const getPosterUrl = (
  posterPath: string | null,
  size: string = "w500"
): string => {
  if (!posterPath) {
    return "/placeholder-poster.jpg"; // You'll need to add this image
  }
  return `https://image.tmdb.org/t/p/${size}${posterPath}`;
};

/**
 * Format movie rating for display
 */
export const formatRating = (rating: number): string => {
  return rating.toFixed(1);
};

/**
 * Format movie runtime in hours and minutes
 */
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

/**
 * Check if a movie is recent (released in the last 2 years)
 */
export const isRecentMovie = (releaseDate: string): boolean => {
  const twoYearsAgo = new Date();
  twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

  const movieDate = new Date(releaseDate);
  return movieDate > twoYearsAgo;
};

/**
 * Format currency for display
 */
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

/**
 * Get directors from movie credits
 */
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

/**
 * Get writers from movie credits
 */
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

/**
 * Get top cast members from movie credits (first 8 cast members)
 */
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
    .slice(0, 8) // Get first 8 cast members
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

/**
 * Get trailer videos from movie data
 */
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
    .slice(0, 6) // Limit to 6 trailers
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
