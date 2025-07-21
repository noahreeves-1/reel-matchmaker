import { db } from "@/db/drizzle";
import { users, movies, userRatings, wantToWatch } from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Database utility functions for common operations
 * These will replace localStorage functionality step by step
 */

// User operations
export async function getUserById(userId: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    return user[0] || null;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return user[0] || null;
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null;
  }
}

// Movie operations
export async function getMovieById(movieId: number) {
  try {
    const movie = await db
      .select()
      .from(movies)
      .where(eq(movies.id, movieId))
      .limit(1);
    return movie[0] || null;
  } catch (error) {
    console.error("Error fetching movie:", error);
    return null;
  }
}

export async function saveMovie(movieData: {
  id: number;
  title: string;
  overview?: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: string;
  voteAverage?: number;
  voteCount?: number;
  popularity?: number;
  runtime?: number;
  status?: string;
  tagline?: string;
  budget?: number;
  revenue?: number;
  genres?: Array<{ id: number; name: string }>;
  productionCompanies?: Array<{
    id: number;
    name: string;
    logoPath: string | null;
    originCountry: string;
  }>;
}) {
  try {
    // Use upsert to insert or update movie data
    const result = await db
      .insert(movies)
      .values(movieData)
      .onConflictDoUpdate({
        target: movies.id,
        set: {
          title: movieData.title,
          overview: movieData.overview,
          posterPath: movieData.posterPath,
          backdropPath: movieData.backdropPath,
          releaseDate: movieData.releaseDate,
          voteAverage: movieData.voteAverage,
          voteCount: movieData.voteCount,
          popularity: movieData.popularity,
          runtime: movieData.runtime,
          status: movieData.status,
          tagline: movieData.tagline,
          budget: movieData.budget,
          revenue: movieData.revenue,
          genres: movieData.genres,
          productionCompanies: movieData.productionCompanies,
          lastUpdated: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error saving movie:", error);
    return null;
  }
}

// Rating operations (will replace localStorage rated movies)
export async function getUserRating(userEmail: string, movieId: number) {
  try {
    // First get the user by email
    const user = await getUserByEmail(userEmail);
    if (!user) return null;

    const rating = await db
      .select()
      .from(userRatings)
      .where(
        and(eq(userRatings.userId, user.id), eq(userRatings.movieId, movieId))
      )
      .limit(1);

    return rating[0] || null;
  } catch (error) {
    console.error("Error fetching user rating:", error);
    return null;
  }
}

export async function saveUserRating(
  userEmail: string,
  movieId: number,
  rating: number,
  notes?: string,
  movieTitle?: string,
  posterPath?: string,
  releaseDate?: string
) {
  try {
    // First get the user by email
    const user = await getUserByEmail(userEmail);
    if (!user) return null;

    // Check if movie exists, if not create a placeholder movie
    const existingMovie = await db
      .select()
      .from(movies)
      .where(eq(movies.id, movieId))
      .limit(1);

    if (!existingMovie[0]) {
      // Create a placeholder movie for the rating
      await db.insert(movies).values({
        id: movieId,
        title: movieTitle || `Movie ${movieId}`,
        overview: "Movie created for rating",
        posterPath,
        releaseDate,
        lastUpdated: new Date(),
      });
    }

    // Check if rating already exists
    const existingRating = await getUserRating(userEmail, movieId);

    if (existingRating) {
      // Update existing rating
      const result = await db
        .update(userRatings)
        .set({
          rating,
          notes,
          updatedAt: new Date(),
        })
        .where(
          and(eq(userRatings.userId, user.id), eq(userRatings.movieId, movieId))
        )
        .returning();

      return result[0];
    } else {
      // Create new rating
      const result = await db
        .insert(userRatings)
        .values({
          userId: user.id,
          movieId,
          rating,
          notes,
        })
        .returning();

      return result[0];
    }
  } catch (error) {
    console.error("Error saving user rating:", error);
    return null;
  }
}

export async function getUserRatings(userEmail: string) {
  try {
    // First get the user by email
    const user = await getUserByEmail(userEmail);
    if (!user) return [];

    const ratings = await db
      .select()
      .from(userRatings)
      .where(eq(userRatings.userId, user.id));

    return ratings;
  } catch (error) {
    console.error("Error fetching user ratings:", error);
    return [];
  }
}

export async function removeUserRating(userEmail: string, movieId: number) {
  try {
    // First get the user by email
    const user = await getUserByEmail(userEmail);
    if (!user) return null;

    const result = await db
      .delete(userRatings)
      .where(
        and(eq(userRatings.userId, user.id), eq(userRatings.movieId, movieId))
      )
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error removing user rating:", error);
    return null;
  }
}

// Want to watch operations (will replace localStorage want-to-watch list)
export async function isInWantToWatch(userId: string, movieId: number) {
  try {
    const item = await db
      .select()
      .from(wantToWatch)
      .where(
        and(eq(wantToWatch.userId, userId), eq(wantToWatch.movieId, movieId))
      )
      .limit(1);

    return item[0] || null;
  } catch (error) {
    console.error("Error checking want to watch:", error);
    return null;
  }
}

export async function addToWantToWatch(
  userEmail: string,
  movieId: number,
  priority?: number,
  notes?: string,
  movieTitle?: string,
  posterPath?: string,
  releaseDate?: string
) {
  try {
    // First get the user by email
    const user = await getUserByEmail(userEmail);
    if (!user) return null;

    // Check if movie exists, if not create a placeholder movie
    const existingMovie = await db
      .select()
      .from(movies)
      .where(eq(movies.id, movieId))
      .limit(1);

    if (!existingMovie[0]) {
      // Create a placeholder movie for the want-to-watch
      await db.insert(movies).values({
        id: movieId,
        title: movieTitle || `Movie ${movieId}`,
        overview: "Movie created for want-to-watch",
        posterPath,
        releaseDate,
        lastUpdated: new Date(),
      });
    }

    // Check if already in want to watch
    const existing = await isInWantToWatch(user.id, movieId);

    if (existing) {
      return existing; // Already in list
    }

    const result = await db
      .insert(wantToWatch)
      .values({
        userId: user.id,
        movieId,
        priority: priority || 1,
        notes,
        movieTitle: movieTitle || `Movie ${movieId}`,
        posterPath,
        releaseDate,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error adding to want to watch:", error);
    return null;
  }
}

export async function removeFromWantToWatch(
  userEmail: string,
  movieId: number
) {
  try {
    // First get the user by email
    const user = await getUserByEmail(userEmail);
    if (!user) return null;

    const result = await db
      .delete(wantToWatch)
      .where(
        and(eq(wantToWatch.userId, user.id), eq(wantToWatch.movieId, movieId))
      )
      .returning();

    return result[0] || null;
  } catch (error) {
    console.error("Error removing from want to watch:", error);
    return null;
  }
}

export async function getWantToWatchList(userEmail: string) {
  try {
    // First get the user by email
    const user = await getUserByEmail(userEmail);
    if (!user) return [];

    const list = await db
      .select()
      .from(wantToWatch)
      .where(eq(wantToWatch.userId, user.id))
      .orderBy(wantToWatch.addedAt);

    return list;
  } catch (error) {
    console.error("Error fetching want to watch list:", error);
    return [];
  }
}
