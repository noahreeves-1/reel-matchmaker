import Link from "next/link";

interface ErrorPageProps {
  title: string;
  description: string;
  emoji?: string;
  actions?: Array<{
    label: string;
    href: string;
    variant?: "primary" | "secondary";
  }>;
}

// Reusable error page component with consistent styling and actions
export const ErrorPage = ({
  title,
  description,
  emoji = "⚠️",
  actions = [
    { label: "Go Home", href: "/", variant: "primary" as const },
    { label: "Browse Movies", href: "/movies", variant: "secondary" as const },
  ],
}: ErrorPageProps) => {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">{emoji}</div>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
        {title}
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
        {description}
      </p>
      <div className="space-x-4">
        {actions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              action.variant === "primary"
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                : "border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  );
};
