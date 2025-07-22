# Architecture Cleanup: Server-Side vs Client-Side Separation

## Problem Identified

The codebase had confusing architecture with:

1. `src/lib/server-only.ts` - Contains server-side functions using NextAuth's `auth()`
2. `src/hooks/server/` - Contains server-side functions calling TMDB API
3. Confusing naming that suggested client-side hooks were server-side

## Solution: Consolidated Server Functions

### **`src/lib/server-functions.ts`** - All Server-Side Operations

- **Purpose**: Consolidated server-side functions for SSR/ISR
- **Usage**: Server Components, API Routes, Server Actions
- **Two Main Categories**:

#### 1. User Authentication & Database Operations

- `getUserRatedMovies()` - Gets user's ratings from database
- Uses NextAuth's `auth()` function for authentication
- Returns user-specific data for SSR

#### 2. External API Calls (TMDB)

- `getInitialMovies()` - Fetches popular movies from TMDB
- `getMovieData()` - Fetches movie details from TMDB
- `getInitialGenres()` - Fetches genres from TMDB
- `getMoviesByGenreData()` - Fetches movies by genre from TMDB
- `getUserMovieDetails()` - Fetches details for user's rated movies

### 3. **`src/hooks/`** - Client-Side React Hooks Only

- **Purpose**: Client-side React hooks for state management
- **Usage**: Client Components
- **Structure**:
  - `/queries` - React Query hooks for data fetching
  - `/user` - User-specific state management hooks
  - `/ui` - UI state management hooks

## Key Differences Explained

### NextAuth's `auth()` vs `useSession()`

```typescript
// SERVER-SIDE (server-only.ts)
import { auth } from "@/auth";
const session = await auth(); // Server-side only

// CLIENT-SIDE (React hooks)
import { useSession } from "next-auth/react";
const { data: session } = useSession(); // Client-side hook
```

### When to Use Each

**Use `src/lib/server-functions.ts` when:**

- You need user data in Server Components (authentication operations)
- You need to fetch external API data (TMDB) in Server Components
- You're doing SSR/ISR for any server-side data fetching
- You need to pre-fetch data for initial page loads

**Use `src/hooks/` when:**

**Use `src/hooks/` when:**

- You're in Client Components
- You need reactive state management
- You need to handle user interactions

## Migration Summary

### Files Consolidated

- `src/hooks/server/useServerData.ts` → `src/lib/server-functions.ts`
- `src/lib/server-only.ts` → `src/lib/server-functions.ts`
- `src/hooks/server/index.ts` → Deleted (no longer needed)

### Import Updates

- All imports from `@/hooks/server` → `@/lib/server-functions`
- All imports from `@/lib/server-only` → `@/lib/server-functions`
- All imports from `@/lib/server-data` → `@/lib/server-functions`
- Updated in:
  - `src/app/movies/page.tsx`
  - `src/app/movies/[id]/page.tsx`
  - `src/app/genres/page.tsx`
  - `src/app/genres/[id]/page.tsx`
  - `src/app/my-movies/page.tsx`

### Documentation Updated

- `src/hooks/README.md` - Updated to reflect new structure
- Added clear comments explaining the separation

## Benefits

1. **Clear Separation**: Server-side vs client-side code is now obvious
2. **Better Organization**: Related functionality is grouped together
3. **Reduced Confusion**: No more misleading "server hooks" in hooks folder
4. **Easier Maintenance**: Clear boundaries between different types of code
5. **Better Developer Experience**: Intuitive file locations and naming

## Final Architecture

The architecture is now clean and follows Next.js best practices:

- **`src/lib/server-functions.ts`** - All server-side operations (auth + external APIs)
- **`src/hooks/`** - Client-side React hooks only
- **Clear separation** between server and client code
- **Intuitive naming** and organization
- **Single source of truth** for server-side functions
