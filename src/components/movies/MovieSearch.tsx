"use client";

import { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

interface MovieSearchProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isLoading?: boolean;
  searchQuery?: string;
}

export const MovieSearch = ({
  onSearch,
  onClear,
  isLoading = false,
  searchQuery = "",
}: MovieSearchProps) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [isDebouncing, setIsDebouncing] = useState(false);

  // Debounced search effect
  useEffect(() => {
    if (inputValue !== searchQuery) {
      setIsDebouncing(true);
    }

    const timeoutId = setTimeout(() => {
      if (inputValue !== searchQuery) {
        onSearch(inputValue);
      }
      setIsDebouncing(false);
    }, 800); // Increased debounce time for better UX

    return () => {
      clearTimeout(timeoutId);
      setIsDebouncing(false);
    };
  }, [inputValue, onSearch, searchQuery]);

  // Update input value when searchQuery changes externally
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleClear = useCallback(() => {
    setInputValue("");
    setIsDebouncing(false);
    onClear();
  }, [onClear]);

  return (
    <div className="relative max-w-lg mx-auto mb-8">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          type="text"
          placeholder="Search for movies..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-12 pr-12 h-12 text-lg"
          disabled={isLoading}
        />
        {inputValue && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        </div>
      )}
      {isDebouncing && !isLoading && inputValue && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
