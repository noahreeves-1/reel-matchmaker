import { MyMoviesPage } from "@/components/movies/MyMoviesPage";
import { getUserRatedMovies } from "@/lib/server-functions";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Server-Side Rendering (SSR) page for user-specific data
// Requires authentication and user-specific data fetching

export const metadata = {
  title: "My Movies - Reel Matchmaker",
  description: "Your personal movie collection with ratings and watchlist",
  keywords: ["my movies", "ratings", "watchlist", "personal", "collection"],
};

export default async function MyMoviesPageRoute() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const userData = await getUserRatedMovies();

  return <MyMoviesPage initialData={userData} />;
}
