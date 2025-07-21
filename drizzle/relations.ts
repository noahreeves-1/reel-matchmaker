import { relations } from "drizzle-orm/relations";
import { users, userRatings, movies, wantToWatch, recommendations, watchHistory } from "./schema";

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

export const usersRelations = relations(users, ({many}) => ({
	userRatings: many(userRatings),
	wantToWatches: many(wantToWatch),
	recommendations: many(recommendations),
	watchHistories: many(watchHistory),
}));

export const moviesRelations = relations(movies, ({many}) => ({
	userRatings: many(userRatings),
	wantToWatches: many(wantToWatch),
	recommendations: many(recommendations),
	watchHistories: many(watchHistory),
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