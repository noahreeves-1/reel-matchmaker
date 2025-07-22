import { relations } from "drizzle-orm/relations";
import { users, recommendations, movies, wantToWatch, watchHistory, userRatings } from "./schema";

export const recommendationsRelations = relations(recommendations, ({one}) => ({
	user: one(users, {
		fields: [recommendations.userId],
		references: [users.id]
	}),
	movie: one(movies, {
		fields: [recommendations.movieId],
		references: [movies.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	recommendations: many(recommendations),
	wantToWatches: many(wantToWatch),
	watchHistories: many(watchHistory),
	userRatings: many(userRatings),
}));

export const moviesRelations = relations(movies, ({many}) => ({
	recommendations: many(recommendations),
	wantToWatches: many(wantToWatch),
	watchHistories: many(watchHistory),
	userRatings: many(userRatings),
}));

export const wantToWatchRelations = relations(wantToWatch, ({one}) => ({
	user: one(users, {
		fields: [wantToWatch.userId],
		references: [users.id]
	}),
	movie: one(movies, {
		fields: [wantToWatch.movieId],
		references: [movies.id]
	}),
}));

export const watchHistoryRelations = relations(watchHistory, ({one}) => ({
	user: one(users, {
		fields: [watchHistory.userId],
		references: [users.id]
	}),
	movie: one(movies, {
		fields: [watchHistory.movieId],
		references: [movies.id]
	}),
}));

export const userRatingsRelations = relations(userRatings, ({one}) => ({
	user: one(users, {
		fields: [userRatings.userId],
		references: [users.id]
	}),
	movie: one(movies, {
		fields: [userRatings.movieId],
		references: [movies.id]
	}),
}));