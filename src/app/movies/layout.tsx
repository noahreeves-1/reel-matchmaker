import { Header, Footer } from "@/components/layout";

export default function MoviesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
