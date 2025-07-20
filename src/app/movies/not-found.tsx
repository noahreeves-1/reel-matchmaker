import { Breadcrumb, ErrorPage, PageContainer } from "@/components/common";

/**
 * Movies not found page component
 * Displays when movies route is not found
 */
export default function MoviesNotFound() {
  const breadcrumbItems = [{ label: "Home", href: "/" }, { label: "Movies" }];

  return (
    <PageContainer>
      <Breadcrumb items={breadcrumbItems} />

      <ErrorPage
        title="Movies Not Found"
        description="Sorry, we couldn't find the movies you're looking for. The page might have been moved or doesn't exist."
        emoji="🎬"
      />
    </PageContainer>
  );
}
