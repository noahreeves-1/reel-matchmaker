import { db } from "@/db/drizzle";
import {
  users,
  movies,
  userRatings,
  wantToWatch,
  recommendations,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

// Database utility functions for common operations

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

// Rating operations
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

    const existingMovie = await db
      .select()
      .from(movies)
      .where(eq(movies.id, movieId))
      .limit(1);

    if (!existingMovie[0]) {
      await db.insert(movies).values({
        id: movieId,
        title: movieTitle || `Movie ${movieId}`,
        overview: "Movie created for rating",
        posterPath,
        releaseDate,
        lastUpdated: new Date(),
      });
    }

    const existingRating = await getUserRating(userEmail, movieId);

    if (existingRating) {
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

// Want to watch operations
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
    poster_path?: string | null;
    backdropPath?: string | null;
    backdrop_path?: string | null;
    releaseDate?: string;
    release_date?: string;
    overview?: string;
    vote_average?: number;
    vote_count?: number;
    revenue?: number;
    popularity?: number;
    runtime?: number;
    status?: string;
    tagline?: string;
    budget?: number;
    genres?: Array<{ id: number; name: string }>;
    productionCompanies?: Array<{
      id: number;
      name: string;
      logoPath: string | null;
      originCountry: string;
    }>;
    production_companies?: Array<{
      id: number;
      name: string;
      logo_path: string | null;
      origin_country: string;
    }>;
  }>
) {
  try {
    // First get the user by email
    const user = await getUserByEmail(userEmail);
    if (!user) return [];

    const savedRecommendations = [];

    for (const rec of recommendationData) {
      const existingMovie = await db
        .select()
        .from(movies)
        .where(eq(movies.id, rec.id))
        .limit(1);

      if (!existingMovie[0]) {
        await db.insert(movies).values({
          id: rec.id,
          title: rec.title,
          overview: rec.overview || "Movie created for recommendation",
          posterPath: rec.posterPath || rec.poster_path,
          backdropPath: rec.backdropPath || rec.backdrop_path,
          releaseDate: rec.releaseDate || rec.release_date,
          voteAverage: rec.vote_average ? Number(rec.vote_average) : undefined,
          voteCount: rec.vote_count,
          revenue: rec.revenue,
          popularity: rec.popularity ? Number(rec.popularity) : undefined,
          runtime: rec.runtime,
          status: rec.status,
          tagline: rec.tagline,
          budget: rec.budget,
          genres: rec.genres,
          productionCompanies: (() => {
            const companies =
              rec.productionCompanies || rec.production_companies;
            if (!companies) return undefined;

            // Convert snake_case to camelCase if needed
            return companies.map((company) => ({
              id: company.id,
              name: company.name,
              logoPath:
                "logoPath" in company ? company.logoPath : company.logo_path,
              originCountry:
                "originCountry" in company
                  ? company.originCountry
                  : company.origin_country,
            }));
          })(),
          lastUpdated: new Date(),
        });
      } else {
        await db
          .update(movies)
          .set({
            title: rec.title,
            overview: rec.overview || existingMovie[0].overview,
            posterPath:
              rec.posterPath || rec.poster_path || existingMovie[0].posterPath,
            backdropPath:
              rec.backdropPath ||
              rec.backdrop_path ||
              existingMovie[0].backdropPath,
            releaseDate:
              rec.releaseDate ||
              rec.release_date ||
              existingMovie[0].releaseDate,
            voteAverage: (() => {
              const value = rec.vote_average ?? existingMovie[0].voteAverage;
              return value !== null && value !== undefined
                ? Number(value)
                : value;
            })(),
            voteCount: rec.vote_count || existingMovie[0].voteCount,
            revenue: rec.revenue || existingMovie[0].revenue,
            popularity: (() => {
              const value = rec.popularity ?? existingMovie[0].popularity;
              return value !== null && value !== undefined
                ? Number(value)
                : value;
            })(),
            runtime: rec.runtime || existingMovie[0].runtime,
            status: rec.status || existingMovie[0].status,
            tagline: rec.tagline || existingMovie[0].tagline,
            budget: rec.budget || existingMovie[0].budget,
            genres: rec.genres || existingMovie[0].genres,
            productionCompanies: (() => {
              const companies =
                rec.productionCompanies || rec.production_companies;
              if (!companies) return existingMovie[0].productionCompanies;

              // Convert snake_case to camelCase if needed
              return companies.map((company) => ({
                id: company.id,
                name: company.name,
                logoPath:
                  "logoPath" in company ? company.logoPath : company.logo_path,
                originCountry:
                  "originCountry" in company
                    ? company.originCountry
                    : company.origin_country,
              }));
            })(),
            lastUpdated: new Date(),
          })
          .where(eq(movies.id, rec.id));
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

// Get the last 5 recommendations with movie details for a user
// This function joins the recommendations table with the movies table
// to get complete movie information for display
export async function getLastRecommendations(
  userEmail: string,
  limit: number = 5
) {
  try {
    // First get the user by email
    const user = await getUserByEmail(userEmail);
    if (!user) {
      return [];
    }

    const lastRecommendations = await db
      .select({
        id: recommendations.id,
        userId: recommendations.userId,
        movieId: recommendations.movieId,
        reason: recommendations.reason,
        matchScore: recommendations.matchScore,
        matchLevel: recommendations.matchLevel,
        personalizedReason: recommendations.personalizedReason,
        enhancedReason: recommendations.enhancedReason,
        generatedAt: recommendations.generatedAt,
        seen: recommendations.seen,
        actedOn: recommendations.actedOn,
        createdAt: recommendations.createdAt,
        updatedAt: recommendations.updatedAt,
        title: movies.title,
        overview: movies.overview,
        posterPath: movies.posterPath,
        backdropPath: movies.backdropPath,
        releaseDate: movies.releaseDate,
        voteAverage: movies.voteAverage,
        voteCount: movies.voteCount,
        popularity: movies.popularity,
        runtime: movies.runtime,
        status: movies.status,
        tagline: movies.tagline,
        budget: movies.budget,
        revenue: movies.revenue,
        genres: movies.genres,
        productionCompanies: movies.productionCompanies,
      })
      .from(recommendations)
      .innerJoin(movies, eq(recommendations.movieId, movies.id))
      .where(eq(recommendations.userId, user.id))
      .orderBy(desc(recommendations.updatedAt))
      .limit(limit);

    const transformedRecommendations = lastRecommendations.map((rec) => ({
      id: rec.movieId,
      title: rec.title,
      poster_path: rec.posterPath,
      release_date: rec.releaseDate || "",
      overview: rec.overview || "",
      vote_average: rec.voteAverage ? Number(rec.voteAverage) : 0,
      vote_count: rec.voteCount || 0,
      reason: rec.reason,
      personalizedReason: rec.personalizedReason || undefined,
      matchScore: rec.matchScore || undefined,
      matchLevel: rec.matchLevel as
        | "LOVE IT"
        | "LIKE IT"
        | "MAYBE"
        | "RISKY"
        | undefined,
      enhancedReason: rec.enhancedReason || undefined,
      revenue: rec.revenue || undefined,
      popularity: rec.popularity ? Number(rec.popularity) : undefined,
    }));

    return transformedRecommendations;
  } catch (error) {
    console.error("❌ DB: Error fetching last recommendations:", error);
    return [];
  }
}
