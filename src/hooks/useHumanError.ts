'use client';

import { useState, useCallback } from 'react';
import { HumanError, ParseErrorOptions, ShowErrorOptions, UseHumanErrorOptions, UseHumanErrorReturn } from '../types';
import { parseError } from '../parsers/errorParser';

export function useHumanError(options?: UseHumanErrorOptions): UseHumanErrorReturn {
  const [error, setError] = useState<HumanError | null>(null);
  const [lastError, setLastError] = useState<unknown>(null);
  const [retryAction, setRetryAction] = useState<(() => void | Promise<void>) | null>(null);

  const showError = useCallback((err: unknown, showOptions?: ShowErrorOptions) => {
    setLastError(err);
    setRetryAction(() => showOptions?.retryAction ?? null);

    const mergedParserOptions: ParseErrorOptions = {
      ...options?.parserOptions,
      ...showOptions?.parserOptions,
      matchers: [
        ...(options?.parserOptions?.matchers ?? []),
        ...(showOptions?.parserOptions?.matchers ?? []),
      ],
    };

    const humanError = parseError(err, mergedParserOptions);
    setError(humanError);
    options?.onError?.(humanError, err);

    return humanError;
  }, [options]);

  const clearError = useCallback(() => {
    setError(null);
    setRetryAction(null);
  }, []);

  const retry = useCallback(async () => {
    if (!retryAction) {
      return;
    }

    try {
      await retryAction();
      clearError();
    } catch (retryError) {
      const parsedRetryError = showError(retryError);
      options?.onRetryError?.(parsedRetryError, retryError);
    }
  }, [retryAction, clearError, showError, options]);

  return {
    error,
    lastRawError: lastError,
    hasError: error !== null,
    showError,
    clearError,
    setError,
    retry,
  };
}