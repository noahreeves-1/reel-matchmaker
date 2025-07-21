import { db } from "@/db/drizzle";
import {
  users,
  movies,
  userRatings,
  wantToWatch,
  recommendations,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Database utility functions for common operations
 * These will replace localStorage functionality step by step
 */

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

// Recommendation operations (will save AI-generated recommendations to database)
export async function saveRecommendations(
  userEmail: string,
  recommendationData: Array<{
    id: number;
    title: string;
    reason: string;
    personalizedReason: string;
    matchScore?: number;
    matchLevel?: "LOVE IT" | "LIKE IT" | "MAYBE" | "RISKY";
    enhancedReason?: string;
    posterPath?: string | null;
    releaseDate?: string;
  }>
) {
  try {
    // First get the user by email
    const user = await getUserByEmail(userEmail);
    if (!user) return [];

    const savedRecommendations = [];

    for (const rec of recommendationData) {
      // Check if movie exists, if not create a placeholder movie
      const existingMovie = await db
        .select()
        .from(movies)
        .where(eq(movies.id, rec.id))
        .limit(1);

      if (!existingMovie[0]) {
        // Create a placeholder movie for the recommendation
        await db.insert(movies).values({
          id: rec.id,
          title: rec.title,
          overview: "Movie created for recommendation",
          posterPath: rec.posterPath,
          releaseDate: rec.releaseDate,
          lastUpdated: new Date(),
        });
      }

      // Check if recommendation already exists for this user and movie
      const existingRecommendation = await db
        .select()
        .from(recommendations)
        .where(
          and(
            eq(recommendations.userId, user.id),
            eq(recommendations.movieId, rec.id)
          )
        )
        .limit(1);

      if (existingRecommendation[0]) {
        // Update existing recommendation
        const result = await db
          .update(recommendations)
          .set({
            reason: rec.reason,
            personalizedReason: rec.personalizedReason,
            matchScore: rec.matchScore,
            matchLevel: rec.matchLevel,
            enhancedReason: rec.enhancedReason,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(recommendations.userId, user.id),
              eq(recommendations.movieId, rec.id)
            )
          )
          .returning();

        savedRecommendations.push(result[0]);
      } else {
        // Create new recommendation
        const result = await db
          .insert(recommendations)
          .values({
            userId: user.id,
            movieId: rec.id,
            reason: rec.reason,
            personalizedReason: rec.personalizedReason,
            matchScore: rec.matchScore,
            matchLevel: rec.matchLevel,
            enhancedReason: rec.enhancedReason,
          })
          .returning();

        savedRecommendations.push(result[0]);
      }
    }

    return savedRecommendations;
  } catch (error) {
    console.error("Error saving recommendations:", error);
    return [];
  }
}

export async function getUserRecommendations(userEmail: string) {
  try {
    // First get the user by email
    const user = await getUserByEmail(userEmail);
    if (!user) return [];

    const userRecommendations = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.userId, user.id))
      .orderBy(recommendations.generatedAt);

    return userRecommendations;
  } catch (error) {
    console.error("Error fetching user recommendations:", error);
    return [];
  }
}
