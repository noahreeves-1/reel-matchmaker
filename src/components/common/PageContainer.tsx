interface PageContainerProps {
  children: React.ReactNode;
}

// Reusable page container component with consistent layout and spacing
export const PageContainer = ({ children }: PageContainerProps) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </div>
  );
};
