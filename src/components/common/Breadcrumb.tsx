import Link from "next/link";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

// Reusable breadcrumb navigation component
export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="mb-6">
      <ol className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
        {items.map((item, index) => (
          <li key={index}>
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-slate-900 dark:text-white font-medium">
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <span className="text-slate-400 ml-2">/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
