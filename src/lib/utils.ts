import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// UTILITY FUNCTIONS: Common utility functions for the application
// This file provides utility functions for class name merging and other common operations

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
