import { RegisterForm } from "@/components/auth";

// RENDERING STRATEGY: Static Site Generation (SSG)
// - This page is generated at build time and served from CDN
// - No server-side data fetching or dynamic content
// - Benefits: Fastest possible loading, excellent SEO, minimal server load
// - Perfect for: Static forms that don't require server-side data
// - Why SSG? Registration form is static content, interactivity handled by client component
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: No dynamic content, limited personalization, static structure
// - VERCEL OPTIMIZATIONS: Global CDN caching, global distribution, instant loading
// - SCALE BREAKERS: None - this is the most scalable approach
// - FUTURE IMPROVEMENTS: Add server-side validation, progressive enhancement

// Generate metadata for SEO
export const metadata = {
  title: "Create Account - Reel Matchmaker",
  description:
    "Create your account to start rating movies and getting personalized recommendations",
  keywords: ["register", "signup", "account", "movies", "recommendations"],
};

/**
 * Register page component
 * Uses SSG for optimal performance and SEO
 * Interactivity is handled by the RegisterForm client component
 */
export default function RegisterPage() {
  return <RegisterForm />;
}
