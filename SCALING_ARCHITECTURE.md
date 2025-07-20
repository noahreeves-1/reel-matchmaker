# Scaling & Architecture Considerations

This guide explains the current architecture, scaling considerations, and future improvements for Reel Matchmaker.

## 🏗️ Current Architecture Overview

### **Data Flow**

```
User Request → Vercel Edge → ISR Pages (cached) → Client Components → localStorage
                ↓
            API Routes → TMDB/OpenAI → Response
```

### **Storage Strategy**

- **User Data**: localStorage (client-side only)
- **Movie Data**: TMDB API (external)
- **AI Recommendations**: OpenAI API (external)
- **Caching**: Vercel Edge Cache + React Query

## 📊 Current Scaling Limits

### **TMDB API Limits**

- **Rate Limit**: 1,000 requests/day (free tier)
- **Concurrent**: Limited by TMDB's infrastructure
- **Data Freshness**: Depends on TMDB's update frequency

### **OpenAI API Limits**

- **Rate Limit**: Varies by plan
- **Cost**: ~$0.002 per 1K tokens
- **Latency**: 2-10 seconds per request

### **localStorage Limits**

- **Size**: ~5-10MB per domain
- **Persistence**: Browser-dependent
- **Sync**: No cross-device synchronization

### **Vercel Limits**

- **Edge Functions**: 50ms execution time
- **Serverless Functions**: 10s execution time
- **Bandwidth**: 100GB/month (free tier)

## 🚨 Scale Breakers & Bottlenecks

### **1. TMDB Rate Limiting**

```typescript
// CURRENT ISSUE: No rate limit handling
const response = await fetch(
  `${TMDB_BASE_URL}/movie/popular?api_key=${apiKey}`
);

// FUTURE SOLUTION: Add rate limiting and caching
const cachedData = await redis.get("popular-movies");
if (cachedData) return JSON.parse(cachedData);
```

### **2. OpenAI Cost & Latency**

```typescript
// CURRENT ISSUE: Expensive and slow
const recommendation = await generateText({
  model: openai("gpt-4"),
  prompt: `Recommend movies based on: ${userPreferences}`,
});

// FUTURE SOLUTION: Cache recommendations and batch processing
const cachedRecommendations = await redis.get(`recs:${userId}`);
if (cachedRecommendations) return JSON.parse(cachedRecommendations);
```

### **3. localStorage Limitations**

```typescript
// CURRENT ISSUE: No persistence or sync
const [ratedMovies] = useLocalStorage("rated-movies", []);

// FUTURE SOLUTION: Server-side user data
const { data: userData } = useQuery({
  queryKey: ["user", userId],
  queryFn: () => fetchUserData(userId),
});
```

### **4. No User Authentication**

```typescript
// CURRENT ISSUE: No user identification
const userPreferences = localStorage.getItem("preferences");

// FUTURE SOLUTION: Add auth with NextAuth.js
const { data: session } = useSession();
const userPreferences = session?.user?.preferences;
```

## 🔧 Vercel-Specific Optimizations

### **Current Optimizations**

1. **Edge Caching**: ISR pages cached globally
2. **CDN Distribution**: Static assets served from edge
3. **Automatic Scaling**: Serverless functions scale automatically
4. **Edge Functions**: Fast API responses

### **Future Optimizations**

```typescript
// 1. Edge Caching for APIs
export const runtime = "edge";

// 2. Incremental Static Regeneration
export const revalidate = 3600;

// 3. Streaming with Suspense
<Suspense fallback={<Loading />}>
  <SlowComponent />
</Suspense>;

// 4. Image Optimization
import Image from "next/image";
<Image src="/movie.jpg" width={500} height={300} />;
```

## 🚀 Future Architecture Improvements

### **Phase 1: Add Database & Auth**

```typescript
// Database Schema (PostgreSQL)
interface User {
  id: string;
  email: string;
  preferences: UserPreferences;
  ratedMovies: RatedMovie[];
  wantToWatch: WantToWatchMovie[];
}

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  // ... other fields
}

interface UserMovie {
  userId: string;
  movieId: number;
  rating?: number;
  wantToWatch: boolean;
  watchedAt?: Date;
}
```

### **Phase 2: Add Caching Layer**

```typescript
// Redis Caching Strategy
const CACHE_KEYS = {
  POPULAR_MOVIES: "movies:popular",
  MOVIE_DETAILS: (id: number) => `movie:${id}`,
  USER_RECOMMENDATIONS: (userId: string) => `recs:${userId}`,
  TMDB_RESPONSE: (endpoint: string) => `tmdb:${endpoint}`,
} as const;

// Cache Implementation
async function getCachedMovies() {
  const cached = await redis.get(CACHE_KEYS.POPULAR_MOVIES);
  if (cached) return JSON.parse(cached);

  const movies = await fetchFromTMDB();
  await redis.setex(CACHE_KEYS.POPULAR_MOVIES, 3600, JSON.stringify(movies));
  return movies;
}
```

### **Phase 3: Add Real-time Features**

```typescript
// WebSocket for Real-time Updates
import { useSocket } from "@/hooks/useSocket";

function MovieApp() {
  const socket = useSocket();

  useEffect(() => {
    socket.on("movie-updated", (movieId) => {
      // Update UI in real-time
      queryClient.invalidateQueries(["movie", movieId]);
    });
  }, [socket]);
}
```

### **Phase 4: Add Advanced Features**

```typescript
// Batch Processing for Recommendations
async function generateBatchRecommendations(userIds: string[]) {
  const recommendations = await Promise.all(
    userIds.map((id) => generateUserRecommendations(id))
  );

  // Cache all recommendations
  await Promise.all(
    recommendations.map((rec, i) =>
      redis.setex(`recs:${userIds[i]}`, 3600, JSON.stringify(rec))
    )
  );

  return recommendations;
}
```

## 📈 Scaling Metrics & Monitoring

### **Key Metrics to Track**

```typescript
// Performance Metrics
interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
  userEngagement: number;
}

// Business Metrics
interface BusinessMetrics {
  dailyActiveUsers: number;
  recommendationsGenerated: number;
  moviesRated: number;
  conversionRate: number;
}
```

### **Monitoring Setup**

```typescript
// Vercel Analytics
import { Analytics } from "@vercel/analytics/react";

// Custom Error Tracking
import { captureException } from "@sentry/nextjs";

// Performance Monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";
```

## 🎯 Migration Strategy

### **Step 1: Add Authentication**

```bash
npm install next-auth @prisma/client
npm install -D prisma
```

```typescript
// pages/api/auth/[...nextauth].ts
import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export default NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
});
```

### **Step 2: Add Database**

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

```typescript
// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### **Step 3: Add Caching**

```bash
npm install redis
npm install @upstash/redis
```

```typescript
// lib/redis.ts
import { Redis } from "@upstash/redis";

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

### **Step 4: Migrate User Data**

```typescript
// Migration script to move localStorage data to database
async function migrateUserData(userId: string, localStorageData: any) {
  await prisma.user.upsert({
    where: { id: userId },
    update: {
      ratedMovies: localStorageData.ratedMovies,
      wantToWatch: localStorageData.wantToWatch,
    },
    create: {
      id: userId,
      ratedMovies: localStorageData.ratedMovies,
      wantToWatch: localStorageData.wantToWatch,
    },
  });
}
```

## 💰 Cost Optimization

### **Current Costs**

- **Vercel**: Free tier (100GB bandwidth)
- **TMDB**: Free tier (1000 requests/day)
- **OpenAI**: ~$0.002 per recommendation

### **Future Cost Optimization**

```typescript
// 1. Cache expensive operations
const cachedRecommendations = await redis.get(`recs:${userId}`);
if (cachedRecommendations) return JSON.parse(cachedRecommendations);

// 2. Batch API calls
const movieDetails = await Promise.all(
  movieIds.map((id) => getMovieDetails(id))
);

// 3. Use cheaper models for simple tasks
const simpleRecommendation = await generateText({
  model: openai("gpt-3.5-turbo"), // Cheaper than GPT-4
  prompt: simplePrompt,
});
```

## 🔒 Security Considerations

### **Current Security**

- API keys stored in environment variables
- No user authentication
- Client-side data storage

### **Future Security**

```typescript
// 1. Add authentication
import { getServerSession } from "next-auth/next";

// 2. Validate user permissions
async function validateUserAccess(userId: string, resourceId: string) {
  const session = await getServerSession();
  if (session?.user?.id !== userId) {
    throw new Error("Unauthorized");
  }
}

// 3. Rate limiting
import rateLimit from "express-rate-limit";

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});
```

## 📚 Resources

- [Vercel Scaling Guide](https://vercel.com/docs/concepts/edge-network/overview)
- [Next.js Performance](https://nextjs.org/docs/advanced-features/measuring-performance)
- [PostgreSQL with Prisma](https://www.prisma.io/docs/getting-started)
- [Redis Caching](https://redis.io/docs/manual/)
- [NextAuth.js](https://next-auth.js.org/)
