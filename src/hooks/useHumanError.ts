'use client';

import { useState, useCallback } from 'react';
import { HumanError } from '../types';
import { parseError } from '../parsers/errorParser';

interface UseHumanErrorReturn {
  error: HumanError | null;
  showError: (error: any) => void;
  clearError: () => void;
  retry: () => void;
}

export function useHumanError(): UseHumanErrorReturn {
  const [error, setError] = useState<HumanError | null>(null);
  const [lastError, setLastError] = useState<any>(null);

  const showError = useCallback((err: any) => {
    setLastError(err);
    const humanError = parseError(err);
    setError(humanError);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retry = useCallback(() => {
    if (lastError) {
      clearError();
    }
  }, [lastError, clearError]);

  return {
    error,
    showError,
    clearError,
    retry,
  };
}