"use client";

import { useState, useEffect } from "react";

// Reusable loading animation component for async operations
// Displays engaging progress messages with visual indicators

interface LoadingAnimationProps {
  steps?: string[];
  stepInterval?: number;
  showProgressBar?: boolean;
  showTimeEstimate?: boolean;
  timeEstimate?: string;
  variant?: "default" | "purple" | "blue" | "green" | "orange";
  size?: "sm" | "md" | "lg";
  className?: string;
  estimatedDuration?: number;
  preventReset?: boolean;
  showIcon?: boolean;
}

export const LoadingAnimation = ({
  steps = ["Processing...", "Almost done...", "Finalizing..."],
  stepInterval = 1500,
  showProgressBar = true,
  showTimeEstimate = true,
  timeEstimate = "This usually takes a few seconds",
  variant = "default",
  size = "md",
  className = "",
  estimatedDuration,
  preventReset = false,
  showIcon = true,
}: LoadingAnimationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const effectiveStepInterval = estimatedDuration
    ? Math.max(stepInterval, estimatedDuration / steps.length)
    : stepInterval;

  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      setElapsedTime(elapsed);

      if (preventReset && currentStep >= steps.length - 1) {
        return;
      }

      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, effectiveStepInterval);

    return () => clearInterval(interval);
  }, [steps.length, effectiveStepInterval, preventReset, currentStep]);

  const getProgressPercentage = () => {
    if (estimatedDuration && preventReset) {
      const timeProgress = Math.min(
        (elapsedTime / estimatedDuration) * 100,
        100
      );
      const stepProgress = ((currentStep + 1) / steps.length) * 100;
      return Math.max(timeProgress, stepProgress);
    }

    return ((currentStep + 1) / steps.length) * 100;
  };

  const variants = {
    default: {
      bg: "from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20",
      border: "border-slate-200 dark:border-slate-700",
      text: "text-slate-700 dark:text-slate-300",
      dots: "bg-slate-500",
      progress: "from-slate-500 to-slate-600",
      progressBg: "bg-slate-200 dark:bg-slate-700",
      timeText: "text-slate-600 dark:text-slate-400",
    },
    purple: {
      bg: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
      border: "border-purple-200 dark:border-purple-700",
      text: "text-purple-700 dark:text-purple-300",
      dots: "bg-purple-500",
      progress: "from-purple-500 to-pink-500",
      progressBg: "bg-purple-200 dark:bg-purple-700",
      timeText: "text-purple-600 dark:text-purple-400",
    },
    blue: {
      bg: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
      border: "border-blue-200 dark:border-blue-700",
      text: "text-blue-700 dark:text-blue-300",
      dots: "bg-blue-500",
      progress: "from-blue-500 to-cyan-500",
      progressBg: "bg-blue-200 dark:bg-blue-700",
      timeText: "text-blue-600 dark:text-blue-400",
    },
    green: {
      bg: "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20",
      border: "border-green-200 dark:border-green-700",
      text: "text-green-700 dark:text-green-300",
      dots: "bg-green-500",
      progress: "from-green-500 to-emerald-500",
      progressBg: "bg-green-200 dark:bg-green-700",
      timeText: "text-green-600 dark:text-green-400",
    },
    orange: {
      bg: "from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20",
      border: "border-orange-200 dark:border-orange-700",
      text: "text-orange-700 dark:text-orange-300",
      dots: "bg-orange-500",
      progress: "from-orange-500 to-amber-500",
      progressBg: "bg-orange-200 dark:bg-orange-700",
      timeText: "text-orange-600 dark:text-orange-400",
    },
  };

  const sizes = {
    sm: {
      container: "p-3",
      text: "text-sm",
      icon: "w-4 h-4",
      progress: "h-1",
      dots: "w-1 h-1",
    },
    md: {
      container: "p-4",
      text: "text-base",
      icon: "w-5 h-5",
      progress: "h-2",
      dots: "w-1.5 h-1.5",
    },
    lg: {
      container: "p-6",
      text: "text-lg",
      icon: "w-6 h-6",
      progress: "h-3",
      dots: "w-2 h-2",
    },
  };

  const currentVariant = variants[variant];
  const currentSize = sizes[size];

  return (
    <div
      className={`bg-gradient-to-r ${currentVariant.bg} border ${currentVariant.border} rounded-lg ${currentSize.container} ${className}`}
    >
      <div className="flex items-center space-x-3">
        {showIcon && (
          <div className="flex-shrink-0">
            <div className={`${currentSize.icon} animate-spin`}>
              <svg className="w-full h-full" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <p
              className={`${currentSize.text} font-medium ${currentVariant.text}`}
            >
              {steps[currentStep]}
            </p>
            <div className="flex space-x-1">
              {[0, 1, 2].map((dot) => (
                <div
                  key={dot}
                  className={`${currentSize.dots} ${currentVariant.dots} rounded-full animate-pulse`}
                  style={{
                    animationDelay: `${dot * 0.2}s`,
                    opacity: dot === currentStep % 3 ? 1 : 0.3,
                  }}
                />
              ))}
            </div>
          </div>

          {showProgressBar && (
            <div className="mt-2">
              <div
                className={`w-full ${currentSize.progress} ${currentVariant.progressBg} rounded-full overflow-hidden`}
              >
                <div
                  className={`h-full bg-gradient-to-r ${currentVariant.progress} transition-all duration-300 ease-out`}
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            </div>
          )}

          {showTimeEstimate && (
            <p
              className={`mt-1 ${
                currentSize.text === "text-sm" ? "text-xs" : "text-sm"
              } ${currentVariant.timeText}`}
            >
              {timeEstimate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
