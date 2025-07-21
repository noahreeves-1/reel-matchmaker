import { LoginForm } from "@/components/auth";

// RENDERING STRATEGY: Static Site Generation (SSG)
// - This page is generated at build time and served from CDN
// - No server-side data fetching or dynamic content
// - Benefits: Fastest possible loading, excellent SEO, minimal server load
// - Perfect for: Static forms that don't require server-side data
// - Why SSG? Login form is static content, interactivity handled by client component
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: No dynamic content, limited personalization, static structure
// - VERCEL OPTIMIZATIONS: Global CDN caching, global distribution, instant loading
// - SCALE BREAKERS: None - this is the most scalable approach
// - FUTURE IMPROVEMENTS: Add server-side validation, progressive enhancement

// Generate metadata for SEO
export const metadata = {
  title: "Sign In - Reel Matchmaker",
  description: "Sign in to rate movies and get personalized recommendations",
  keywords: ["login", "authentication", "movies", "recommendations"],
};

/**
 * Login page component
 * Uses SSG for optimal performance and SEO
 * Interactivity is handled by the LoginForm client component
 */
export default function LoginPage() {
  return <LoginForm />;
}
