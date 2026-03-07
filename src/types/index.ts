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
}