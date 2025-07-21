import { Suspense } from "react";
import { LoadingSkeleton } from "@/components/common";
import { Header } from "@/components/layout/Header";
import { Hero } from "@/components/layout/Hero";
import { Footer } from "@/components/layout/Footer";
import { HowItWorksSection } from "@/components/movies/HowItWorksSection";
import { MovieApp } from "@/components/movies/MovieApp";

// Static Metadata: This overrides the metadata from layout.tsx for this specific page
// This is used for SEO and social media sharing
export const metadata = {
  title: "Reel Matchmaker - AI Movie Recommendations",
  description:
    "Discover your next favorite movie with AI-powered recommendations based on your taste",
  keywords: ["movies", "recommendations", "AI", "TMDB", "streaming"],
};

// RENDERING STRATEGY: Static Page with Dynamic Islands
// - Page component is static (no API calls) for immediate rendering
// - MovieApp component handles its own data fetching
// - Benefits: Fast static content, dynamic data where needed
export default function Home() {
  return (
    <>
      {/* STATIC HEADER */}
      <Header />

      {/* STATIC SECTIONS */}
      <Hero />

      {/* How It Works Section */}
      <section className="bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <HowItWorksSection />
        </div>
      </section>

      {/* DYNAMIC SECTION - MovieApp handles its own data fetching */}
      <section className="bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Suspense fallback={<LoadingSkeleton />}>
            <MovieApp />
          </Suspense>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </>
  );
}
