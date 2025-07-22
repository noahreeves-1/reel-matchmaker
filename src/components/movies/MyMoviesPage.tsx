import { UserInitialData } from "@/types/movie";
import { MyMoviesPageClient } from "./MyMoviesPageClient";

// SERVER COMPONENT: Static my movies page content
// This component handles all server-side rendering (SEO, static content)
// No "use client" directive - runs on server
interface MyMoviesPageProps {
  initialData?: UserInitialData;
}

export const MyMoviesPage = ({ initialData }: MyMoviesPageProps) => {
  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            My Movies
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Manage your rated movies and wish list
          </p>
        </div>

        {/* Client component handles all user interactions and state */}
        <MyMoviesPageClient initialData={initialData} />
      </div>
    </>
  );
};
