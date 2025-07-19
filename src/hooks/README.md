# Hooks Organization

This directory contains all the custom hooks organized by their purpose and functionality.

## Structure

```
src/hooks/
├── queries/          # React Query hooks for data fetching
├── user/            # User-specific data hooks
├── ui/              # UI state management hooks
├── server/          # Server-side data fetching functions
└── index.ts         # Main exports
```

## Query Hooks (`/queries`)

React Query hooks for data fetching with automatic caching and background updates.

### `useMovies`

- **Purpose**: Fetch popular movies or search results with infinite pagination
- **Features**:
  - Automatic caching (5 min stale time)
  - Infinite scroll pagination
  - Search functionality
  - Background refetching

### `usePopularMovies`

- **Purpose**: Fetch popular movies with infinite pagination
- **Features**:
  - Standalone hook for popular movies only
  - Can be used independently

### `useMovieSearch`

- **Purpose**: Search movies with infinite pagination
- **Features**:
  - Standalone hook for search functionality
  - Only enabled when search query is provided

### `useMovieDetails`

- **Purpose**: Fetch details for a single movie
- **Features**:
  - Long-term caching (24 hours)
  - Automatic retry on failure

### `useMovieDetailsBatch`

- **Purpose**: Fetch details for multiple movies in batch
- **Features**:
  - Efficient batch fetching
  - Returns map for easy lookup
  - Long-term caching (24 hours)

## User Hooks (`/user`)

Hooks for managing user-specific data and interactions.

### `useRatedMovies`

- **Purpose**: Manage user's rated movies
- **Features**:
  - Local storage integration
  - Movie details fetching for rated movies
  - Rating removal with confirmation dialog
  - Automatic cache invalidation

## UI Hooks (`/ui`)

Hooks for managing UI state and interactions.

### `useRatingModal`

- **Purpose**: Manage rating modal state
- **Features**:
  - Modal open/close state
  - Current movie selection
  - Clean state management

## Server Hooks (`/server`)

Server-side functions for SSR/ISR data fetching.

### `getInitialMovies`

- **Purpose**: Fetch initial popular movies for server-side rendering
- **Usage**: Server Components, getStaticProps, etc.
- **Features**:
  - Error handling with fallback data
  - Optimized for SSR performance

### `getMovieData`

- **Purpose**: Fetch movie details for server-side rendering
- **Usage**: Server Components, generateMetadata, etc.
- **Features**:
  - Error handling with null fallback
  - Optimized for SSR performance

## Usage Examples

### Basic Movie Fetching

```typescript
import { useMovies } from "@/hooks";

const MyComponent = () => {
  const { movies, isLoading, loadMoreMovies } = useMovies();
  // ...
};
```

### Individual Movie Details

```typescript
import { useMovieDetails } from "@/hooks";

const MovieComponent = ({ movieId }: { movieId: number }) => {
  const { data: movie, isLoading } = useMovieDetails(movieId);
  // ...
};
```

### User Rated Movies

```typescript
import { useRatedMovies } from "@/hooks";

const MyMoviesPage = () => {
  const { ratedMovies, movieDetails, handleRemoveRating } = useRatedMovies();
  // ...
};
```

### Server-Side Data Fetching

```typescript
import { getInitialMovies } from "@/hooks/server";

export default async function Page() {
  const initialMovies = await getInitialMovies();
  // ...
}
```

## Caching Strategy

- **Movie Details**: 24 hours stale time, 7 days garbage collection
- **Popular Movies**: 5 minutes stale time, 30 minutes garbage collection
- **Search Results**: 5 minutes stale time, 30 minutes garbage collection
- **User Data**: Managed by localStorage with React Query integration

## Best Practices

1. **Use specific hooks** when you only need certain functionality
2. **Prefer batch operations** for multiple movie details
3. **Leverage server-side data** for initial page loads
4. **Handle loading and error states** in your components
5. **Use the confirmation dialog** for destructive actions
