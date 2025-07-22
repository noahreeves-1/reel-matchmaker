/**
 * Genres layout component
 * Provides consistent layout structure for all genre pages
 * Note: Header and Footer are now handled by the root layout
 */
export default function GenresLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
