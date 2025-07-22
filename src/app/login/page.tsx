import { LoginForm } from "@/components/auth";

// Static Site Generation (SSG) page for login form
// Generated at build time and served from CDN for optimal performance

export const metadata = {
  title: "Sign In - Reel Matchmaker",
  description: "Sign in to rate movies and get personalized recommendations",
  keywords: ["login", "authentication", "movies", "recommendations"],
};

export default function LoginPage() {
  return <LoginForm />;
}
