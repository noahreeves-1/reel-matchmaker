"use client";

import { MyMoviesPage } from "@/components/movies/MyMoviesPage";

// RENDERING STRATEGY: Client-Side Rendering (CSR)
// - This page is rendered entirely on the client side
// - No server-side data fetching or pre-rendering
// - Benefits: Always shows latest user data, interactive features
// - Perfect for: User-specific pages that depend on localStorage data
// - Why CSR? User's rated movies are stored in localStorage
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: No SEO, slower initial load, data loss if localStorage is cleared
// - VERCEL OPTIMIZATIONS: Static hosting, CDN caching for assets, client-side processing
// - SCALE BREAKERS: localStorage size limits, no cross-device sync, no backup
// - FUTURE IMPROVEMENTS: Add PostgreSQL + auth, server-side user data, cross-device sync, so we need client-side access
export default function MyMovies() {
  return <MyMoviesPage />;
}
