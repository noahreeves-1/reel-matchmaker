"use client";

import { useState, useEffect } from "react";

// LOADING ANIMATION: Reusable component for showing progress during async operations
// This component displays engaging progress messages with visual indicators
// to make waiting times feel shorter and more interactive
//
// USAGE EXAMPLES:
// - AI recommendation generation
// - Data fetching operations
// - File uploads
// - Any long-running async process

interface LoadingAnimationProps {
  steps?: string[];
  stepInterval?: number; // milliseconds between step changes
  showProgressBar?: boolean;
  showTimeEstimate?: boolean;
  timeEstimate?: string;
  variant?: "default" | "purple" | "blue" | "green" | "orange";
  size?: "sm" | "md" | "lg";
  className?: string;
  // New props for better UX
  estimatedDuration?: number; // estimated duration in milliseconds
  preventReset?: boolean; // prevent progress bar from resetting
  showIcon?: boolean; // whether to show the icon
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

  // Calculate step interval based on estimated duration if provided
  const effectiveStepInterval = estimatedDuration
    ? Math.max(stepInterval, estimatedDuration / steps.length)
    : stepInterval;

  useEffect(() => {
    const startTime = Date.now();

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = now - startTime;
      setElapsedTime(elapsed);

      // If preventReset is true, stop cycling when we reach the end
      if (preventReset && currentStep >= steps.length - 1) {
        return;
      }

      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, effectiveStepInterval);

    return () => clearInterval(interval);
  }, [steps.length, effectiveStepInterval, preventReset, currentStep]);

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (estimatedDuration && preventReset) {
      // Use time-based progress when we have an estimated duration
      const timeProgress = Math.min(
        (elapsedTime / estimatedDuration) * 100,
        100
      );
      const stepProgress = ((currentStep + 1) / steps.length) * 100;
      // Use the higher of the two to ensure progress never goes backwards
      return Math.max(timeProgress, stepProgress);
    }

    // Default step-based progress
    return ((currentStep + 1) / steps.length) * 100;
  };

  // Variant configurations
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
      bg: "from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20",
      border: "border-blue-200 dark:border-blue-700",
      text: "text-blue-700 dark:text-blue-300",
      dots: "bg-blue-500",
      progress: "from-blue-500 to-indigo-500",
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
      bg: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
      border: "border-amber-200 dark:border-amber-700",
      text: "text-amber-700 dark:text-amber-300",
      dots: "bg-amber-500",
      progress: "from-amber-500 to-orange-500",
      progressBg: "bg-amber-200 dark:bg-amber-700",
      timeText: "text-amber-600 dark:text-amber-400",
    },
  };

  // Size configurations
  const sizes = {
    sm: {
      padding: "p-4",
      textSize: "text-sm",
      dotsSize: "w-1.5 h-1.5",
      iconSize: "w-4 h-4",
      timeTextSize: "text-xs",
    },
    md: {
      padding: "p-6",
      textSize: "text-base",
      dotsSize: "w-2 h-2",
      iconSize: "w-5 h-5",
      timeTextSize: "text-xs",
    },
    lg: {
      padding: "p-8",
      textSize: "text-lg",
      dotsSize: "w-2.5 h-2.5",
      iconSize: "w-6 h-6",
      timeTextSize: "text-sm",
    },
  };

  const config = variants[variant];
  const sizeConfig = sizes[size];

  return (
    <div
      className={`bg-gradient-to-r ${config.bg} rounded-lg ${config.border} ${sizeConfig.padding} ${className}`}
    >
      <div className="flex items-center justify-center space-x-4">
        {/* Animated dots */}
        <div className="flex space-x-1">
          <div
            className={`${sizeConfig.dotsSize} ${config.dots} rounded-full animate-bounce`}
            style={{ animationDelay: "0ms" }}
          ></div>
          <div
            className={`${sizeConfig.dotsSize} ${config.dots} rounded-full animate-bounce`}
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className={`${sizeConfig.dotsSize} ${config.dots} rounded-full animate-bounce`}
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>

        {/* Progress message */}
        <p
          className={`${config.text} font-medium text-center ${sizeConfig.textSize}`}
        >
          {steps[currentStep]}
        </p>

        {/* Icon */}
        {showIcon && (
          <div className={config.text}>
            <svg
              className={sizeConfig.iconSize}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {showProgressBar && (
        <div className={`mt-4 w-full ${config.progressBg} rounded-full h-2`}>
          <div
            className={`bg-gradient-to-r ${config.progress} h-2 rounded-full transition-all duration-1000 ease-out`}
            style={{
              width: `${getProgressPercentage()}%`,
            }}
          ></div>
        </div>
      )}

      {/* Time estimate */}
      {showTimeEstimate && (
        <p
          className={`${config.timeText} ${sizeConfig.timeTextSize} text-center mt-2`}
        >
          {timeEstimate}
        </p>
      )}
    </div>
  );
};
