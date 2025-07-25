/**
 * Movies layout component
 * Provides consistent layout structure for all movies pages
 * Note: Header and Footer are now handled by the root layout
 */
export default function MoviesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
