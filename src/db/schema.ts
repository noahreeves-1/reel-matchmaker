import {
  integer,
  text,
  boolean,
  pgTable,
  timestamp,
  uuid,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// USERS TABLE: Store user information and preferences
// This replaces localStorage user data with persistent database storage
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Hashed password
  name: text("name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  // Store user preferences as JSON for flexibility
  preferences: jsonb("preferences").$type<{
    favoriteGenres?: number[];
    preferredLanguage?: string;
    includeAdult?: boolean;
  }>(),
});

// MOVIES TABLE: Cache movie data from TMDB to reduce API calls
// This stores frequently accessed movie information locally
export const movies = pgTable("movies", {
  id: integer("id").primaryKey(), // TMDB movie ID
  title: text("title").notNull(),
  overview: text("overview"),
  posterPath: text("poster_path"),
  backdropPath: text("backdrop_path"),
  releaseDate: text("release_date"),
  voteAverage: integer("vote_average"),
  voteCount: integer("vote_count"),
  popularity: integer("popularity"),
  runtime: integer("runtime"),
  status: text("status"),
  tagline: text("tagline"),
  budget: integer("budget"),
  revenue: integer("revenue"),
  // Store additional data as JSON for flexibility
  genres: jsonb("genres").$type<Array<{ id: number; name: string }>>(),
  productionCompanies: jsonb("production_companies").$type<
    Array<{
      id: number;
      name: string;
      logoPath: string | null;
      originCountry: string;
    }>
  >(),
  // Track when we last updated this movie from TMDB
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// USER RATINGS TABLE: Store user movie ratings
// This replaces localStorage rated movies with persistent storage
export const userRatings = pgTable("user_ratings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  movieId: integer("movie_id")
    .notNull()
    .references(() => movies.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-10 scale
  ratedAt: timestamp("rated_at").defaultNow().notNull(),
  // Store additional rating metadata
  notes: text("notes"), // Optional user notes about the movie
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// WANT TO WATCH TABLE: Store user's watch list
// This replaces localStorage want-to-watch list with persistent storage
export const wantToWatch = pgTable("want_to_watch", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  movieId: integer("movie_id")
    .notNull()
    .references(() => movies.id, { onDelete: "cascade" }),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  // Optional priority level for the watch list
  priority: integer("priority").default(1), // 1-5 scale, 1 being highest priority
  notes: text("notes"), // Optional notes about why they want to watch
  // Store movie metadata for quick access without joining movies table
  movieTitle: text("movie_title"),
  posterPath: text("poster_path"),
  releaseDate: text("release_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// RECOMMENDATIONS TABLE: Cache AI-generated recommendations
// This stores recommendations to avoid regenerating them frequently
export const recommendations = pgTable("recommendations", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  movieId: integer("movie_id")
    .notNull()
    .references(() => movies.id, { onDelete: "cascade" }),
  reason: text("reason").notNull(), // AI-generated reason for recommendation
  matchScore: integer("match_score"), // 1-100 score
  matchLevel: text("match_level").$type<
    "LOVE IT" | "LIKE IT" | "MAYBE" | "RISKY"
  >(),
  personalizedReason: text("personalized_reason"),
  enhancedReason: text("enhanced_reason"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  // Track if user has seen this recommendation
  seen: boolean("seen").default(false),
  // Track if user acted on this recommendation (rated/watched)
  actedOn: boolean("acted_on").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// WATCH HISTORY TABLE: Track movies user has watched
// This helps with recommendation accuracy and user analytics
export const watchHistory = pgTable("watch_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  movieId: integer("movie_id")
    .notNull()
    .references(() => movies.id, { onDelete: "cascade" }),
  watchedAt: timestamp("watched_at").defaultNow().notNull(),
  // Track how they watched it (streaming service, theater, etc.)
  watchMethod: text("watch_method").$type<
    "streaming" | "theater" | "dvd" | "other"
  >(),
  // Optional rating given after watching
  rating: integer("rating"), // 1-10 scale
  // Optional review
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// RELATIONS: Define relationships between tables
// This helps with type safety and query optimization

export const usersRelations = relations(users, ({ many }) => ({
  ratings: many(userRatings),
  wantToWatch: many(wantToWatch),
  recommendations: many(recommendations),
  watchHistory: many(watchHistory),
}));

export const moviesRelations = relations(movies, ({ many }) => ({
  ratings: many(userRatings),
  wantToWatch: many(wantToWatch),
  recommendations: many(recommendations),
  watchHistory: many(watchHistory),
}));

export const userRatingsRelations = relations(userRatings, ({ one }) => ({
  user: one(users, {
    fields: [userRatings.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [userRatings.movieId],
    references: [movies.id],
  }),
}));

export const wantToWatchRelations = relations(wantToWatch, ({ one }) => ({
  user: one(users, {
    fields: [wantToWatch.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [wantToWatch.movieId],
    references: [movies.id],
  }),
}));

export const recommendationsRelations = relations(
  recommendations,
  ({ one }) => ({
    user: one(users, {
      fields: [recommendations.userId],
      references: [users.id],
    }),
    movie: one(movies, {
      fields: [recommendations.movieId],
      references: [movies.id],
    }),
  })
);

export const watchHistoryRelations = relations(watchHistory, ({ one }) => ({
  user: one(users, {
    fields: [watchHistory.userId],
    references: [users.id],
  }),
  movie: one(movies, {
    fields: [watchHistory.movieId],
    references: [movies.id],
  }),
}));

// EXPORT TYPES: TypeScript types for the schema
// These help with type safety throughout the application

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Movie = typeof movies.$inferSelect;
export type NewMovie = typeof movies.$inferInsert;

export type UserRating = typeof userRatings.$inferSelect;
export type NewUserRating = typeof userRatings.$inferInsert;

export type WantToWatch = typeof wantToWatch.$inferSelect;
export type NewWantToWatch = typeof wantToWatch.$inferInsert;

export type Recommendation = typeof recommendations.$inferSelect;
export type NewRecommendation = typeof recommendations.$inferInsert;

export type WatchHistory = typeof watchHistory.$inferSelect;
export type NewWatchHistory = typeof watchHistory.$inferInsert;
