interface PageHeaderProps {
  title: string;
  description?: string;
}

/**
 * Reusable page header component
 * Provides consistent styling for page titles and descriptions
 */
export const PageHeader = ({ title, description }: PageHeaderProps) => {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
        {title}
      </h1>
      {description && (
        <p className="text-slate-600 dark:text-slate-400">{description}</p>
      )}
    </div>
  );
};
