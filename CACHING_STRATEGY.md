# Caching Strategy for Reel Matchmaker

## Overview

This document explains the multi-layered caching strategy implemented to optimize performance and reduce API calls to TMDB.

## Caching Layers

### 1. Next.js API Route Caching

**Location**: `/src/app/api/movies/[id]/route.ts`, `/src/app/api/movies/route.ts`, `/src/app/api/movies/search/route.ts`

**Strategy**: Server-side caching using Next.js `revalidate` and `Cache-Control` headers

**Cache Durations**:

- **Movie Details**: 24 hours (movies don't change frequently)
- **Popular Movies**: 1 hour (can change more frequently)
- **Search Results**: 30 minutes (search results can vary)

**Benefits**:

- Reduces TMDB API calls by ~90%
- Improves response times
- Respects TMDB rate limits (1000 requests/day)
- Automatic cache invalidation with tags

### 2. React Query Client-Side Caching

**Location**: `/src/hooks/queries/useMovieDetails.ts`

**Strategy**: Client-side caching with intelligent background updates

**Cache Configuration**:

- **Stale Time**: 24 hours (how long data is considered fresh)
- **Garbage Collection**: 7 days (how long to keep unused data)
- **Retry Logic**: 2 attempts for failed requests

**Benefits**:

- Eliminates duplicate requests
- Background data updates
- Offline capability
- Optimistic updates

### 3. Browser Caching

**Strategy**: HTTP cache headers for CDN and browser caching

**Headers Added**:

```http
Cache-Control: public, s-maxage=86400, stale-while-revalidate=604800
```

**Benefits**:

- CDN caching (Vercel Edge Network)
- Browser caching
- Reduced server load

## Cache Invalidation

### Manual Invalidation

**API Route**: `/api/revalidate?tag=movie-{id}`

**Usage**:

```typescript
// Invalidate specific movie cache
await fetch("/api/revalidate?tag=movie-123", { method: "POST" });

// Invalidate popular movies cache
await fetch("/api/revalidate?tag=popular-movies-page-1", { method: "POST" });
```

### Automatic Invalidation

- **Time-based**: Caches automatically expire based on `revalidate` settings
- **Tag-based**: Related caches can be invalidated together
- **Background updates**: React Query updates stale data in background

## Performance Impact

### Before Caching

- **My Movies Page**: 61 API calls to TMDB (one per rated movie)
- **Response Time**: 2-5 seconds for large lists
- **Rate Limit Risk**: High (61 requests per page load)

### After Caching

- **First Load**: 61 API calls (cached for 24 hours)
- **Subsequent Loads**: 0 API calls (served from cache)
- **Response Time**: <500ms for cached data
- **Rate Limit Risk**: Low (only fresh requests hit TMDB)

## Monitoring and Debugging

### Cache Status Check

```bash
# Check cache invalidation endpoint
curl http://localhost:3000/api/revalidate?tag=movie-123
```

### React Query DevTools

Enable React Query DevTools to monitor cache state:

```typescript
// In development
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
```

## Future Improvements

1. **Redis Caching**: For multi-server deployments
2. **Cache Warming**: Pre-populate popular movie caches
3. **Intelligent Prefetching**: Predict user behavior
4. **Cache Analytics**: Monitor cache hit rates
5. **Dynamic Cache TTL**: Adjust based on movie popularity

## Best Practices

1. **Cache Tags**: Use descriptive tags for easy invalidation
2. **Stale-While-Revalidate**: Always provide fallback data
3. **Error Handling**: Graceful degradation when cache fails
4. **Monitoring**: Track cache performance and hit rates
5. **Testing**: Test cache behavior in different scenarios
