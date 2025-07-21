import { pgTable, foreignKey, uuid, integer, timestamp, text, jsonb, unique, boolean } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const userRatings = pgTable("user_ratings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	movieId: integer("movie_id").notNull(),
	rating: integer().notNull(),
	ratedAt: timestamp("rated_at", { mode: 'string' }).defaultNow().notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_ratings_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: "user_ratings_movie_id_movies_id_fk"
		}).onDelete("cascade"),
]);

export const movies = pgTable("movies", {
	id: integer().primaryKey().notNull(),
	title: text().notNull(),
	overview: text(),
	posterPath: text("poster_path"),
	backdropPath: text("backdrop_path"),
	releaseDate: text("release_date"),
	voteAverage: integer("vote_average"),
	voteCount: integer("vote_count"),
	popularity: integer(),
	runtime: integer(),
	status: text(),
	tagline: text(),
	budget: integer(),
	revenue: integer(),
	genres: jsonb(),
	productionCompanies: jsonb("production_companies"),
	lastUpdated: timestamp("last_updated", { mode: 'string' }).defaultNow().notNull(),
});

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: text().notNull(),
	name: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	preferences: jsonb(),
	password: text().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const wantToWatch = pgTable("want_to_watch", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	movieId: integer("movie_id").notNull(),
	addedAt: timestamp("added_at", { mode: 'string' }).defaultNow().notNull(),
	priority: integer().default(1),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "want_to_watch_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: "want_to_watch_movie_id_movies_id_fk"
		}).onDelete("cascade"),
]);

export const recommendations = pgTable("recommendations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	movieId: integer("movie_id").notNull(),
	reason: text().notNull(),
	matchScore: integer("match_score"),
	matchLevel: text("match_level"),
	personalizedReason: text("personalized_reason"),
	enhancedReason: text("enhanced_reason"),
	generatedAt: timestamp("generated_at", { mode: 'string' }).defaultNow().notNull(),
	seen: boolean().default(false),
	actedOn: boolean("acted_on").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "recommendations_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: "recommendations_movie_id_movies_id_fk"
		}).onDelete("cascade"),
]);

export const watchHistory = pgTable("watch_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	movieId: integer("movie_id").notNull(),
	watchedAt: timestamp("watched_at", { mode: 'string' }).defaultNow().notNull(),
	watchMethod: text("watch_method"),
	rating: integer(),
	review: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "watch_history_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.movieId],
			foreignColumns: [movies.id],
			name: "watch_history_movie_id_movies_id_fk"
		}).onDelete("cascade"),
]);
