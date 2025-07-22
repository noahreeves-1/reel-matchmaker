import { SpeedInsights } from "@vercel/speed-insights/next";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header, Footer } from "@/components/layout";

// Next.js Font Optimization: Inter font is optimized and self-hosted
// This improves performance by avoiding external font requests
const inter = Inter({ subsets: ["latin"] });

// Static Metadata: This metadata is applied to ALL pages in the app
// It serves as the default metadata that can be overridden by individual pages
export const metadata: Metadata = {
  title: "Reel Matchmaker - Movie Recommender",
  description:
    "Discover your next favorite movie with AI-powered recommendations",
};

// RENDERING STRATEGY: Static Site Generation (SSG)
// - This layout is generated at build time and reused across all pages
// - No revalidation needed - layout structure doesn't change
// - Benefits: Fastest possible loading, excellent SEO, minimal server load
// - Perfect for: Layout structure that's the same for all pages
// - Why SSG? The layout (HTML structure, providers) doesn't change between requests
//
// SCALING CONSIDERATIONS:
// - TRADEOFFS: No dynamic content, limited personalization, static structure
// - VERCEL OPTIMIZATIONS: Global CDN caching, global distribution, instant loading
// - SCALE BREAKERS: None - this is the most scalable approach
// - FUTURE IMPROVEMENTS: Add user-specific header content, dynamic navigation
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {/* Providers: Client-side providers (React Query, etc.) must be in a separate component */}
        {/* This is because Server Components can't use hooks or browser APIs */}
        <Providers>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
