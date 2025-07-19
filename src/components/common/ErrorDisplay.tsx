interface ErrorDisplayProps {
  error: string;
  onRetry: () => void;
}

export const ErrorDisplay = ({ error, onRetry }: ErrorDisplayProps) => (
  <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
    <div className="flex items-center">
      <svg
        className="w-5 h-5 text-red-400 mr-2"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-red-800 dark:text-red-200 font-medium">
        Error loading movies
      </span>
    </div>
    <p className="text-red-600 dark:text-red-300 text-sm mt-1">{error}</p>
    <button
      onClick={onRetry}
      className="mt-2 text-red-600 dark:text-red-300 text-sm underline hover:no-underline"
    >
      Try again
    </button>
  </div>
);
