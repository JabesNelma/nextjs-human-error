export type ErrorType = 'network' | 'validation' | 'server' | 'auth' | 'unknown';

export interface HumanError {
  type: ErrorType;
  title: string;
  message: string;
  action?: string;
  code?: string;
  retryable: boolean;
}

export interface ErrorToastProps {
  error: HumanError;
  onClose: () => void;
  onRetry?: () => void;
  retryLabel?: string;
  closeLabel?: string;
  autoCloseMs?: number;
}

export interface ErrorMatcher {
  when: (error: unknown) => boolean;
  toHumanError: HumanError | ((error: unknown) => HumanError);
}

export interface ParseErrorOptions {
  fallbackError?: HumanError;
  matchers?: ErrorMatcher[];
  disableOfflineDetection?: boolean;
}

export interface ShowErrorOptions {
  retryAction?: () => void | Promise<void>;
  parserOptions?: ParseErrorOptions;
}

export interface UseHumanErrorOptions {
  parserOptions?: ParseErrorOptions;
  onError?: (humanError: HumanError, originalError: unknown) => void;
  onRetryError?: (humanError: HumanError, retryError: unknown) => void;
}

export interface UseHumanErrorReturn {
  error: HumanError | null;
  lastRawError: unknown;
  hasError: boolean;
  showError: (error: unknown, options?: ShowErrorOptions) => HumanError;
  clearError: () => void;
  setError: (error: HumanError) => void;
  retry: () => Promise<void>;
}