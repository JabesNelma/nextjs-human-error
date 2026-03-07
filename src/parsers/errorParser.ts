import { ErrorMatcher, HumanError, ParseErrorOptions } from '../types';

const DEFAULT_ERROR: HumanError = {
  type: 'unknown',
  title: 'Something Went Wrong',
  message: 'An unexpected error occurred. Please try again later.',
  action: 'If the problem persists, contact support.',
  retryable: false,
};

function getMessage(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string') {
      return maybeMessage;
    }
  }

  return '';
}

function getCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object' || !('code' in error)) {
    return undefined;
  }

  const value = (error as { code?: unknown }).code;
  return typeof value === 'string' ? value : undefined;
}

function getStatus(error: unknown): number | undefined {
  if (!error || typeof error !== 'object' || !('status' in error)) {
    return undefined;
  }

  const value = (error as { status?: unknown }).status;
  return typeof value === 'number' ? value : undefined;
}

function getName(error: unknown): string | undefined {
  if (!error || typeof error !== 'object' || !('name' in error)) {
    return undefined;
  }

  const value = (error as { name?: unknown }).name;
  return typeof value === 'string' ? value : undefined;
}

function resolveMatcherError(matcher: ErrorMatcher, error: unknown): HumanError {
  return typeof matcher.toHumanError === 'function'
    ? matcher.toHumanError(error)
    : matcher.toHumanError;
}

function runCustomMatchers(error: unknown, matchers?: ErrorMatcher[]): HumanError | null {
  if (!matchers?.length) {
    return null;
  }

  for (const matcher of matchers) {
    if (matcher.when(error)) {
      return resolveMatcherError(matcher, error);
    }
  }

  return null;
}

export function parseError(error: unknown, options?: ParseErrorOptions): HumanError {
  const customMappedError = runCustomMatchers(error, options?.matchers);
  if (customMappedError) {
    return customMappedError;
  }

  if (isNetworkError(error, options?.disableOfflineDetection ?? false)) {
    return {
      type: 'network',
      title: 'Connection Lost',
      message: 'Unable to connect to the server. Your internet connection may be down or the server is unreachable.',
      action: 'Check your Wi-Fi or mobile data connection and try again.',
      code: 'ERR_NETWORK',
      retryable: true,
    };
  }

  if (isValidationError(error)) {
    return {
      type: 'validation',
      title: 'Invalid Input',
      message: getMessage(error) || 'The information you entered is not valid.',
      action: 'Please check your input and try again.',
      code: getCode(error) || 'ERR_VALIDATION',
      retryable: true,
    };
  }

  if (isAuthError(error)) {
    return {
      type: 'auth',
      title: 'Access Denied',
      message: 'Your session has expired or you do not have permission to perform this action.',
      action: 'Please sign in again to continue.',
      code: getCode(error) || 'ERR_AUTH',
      retryable: true,
    };
  }

  if (isServerError(error)) {
    return {
      type: 'server',
      title: 'Server Error',
      message: 'Our server encountered a problem processing your request. This is temporary.',
      action: 'Please wait a moment and try again.',
      code: getCode(error) || 'ERR_SERVER',
      retryable: true,
    };
  }

  const knownError = mapKnownErrors(error);
  if (knownError) {
    return knownError;
  }

  return options?.fallbackError ?? DEFAULT_ERROR;
}

export function createErrorParser(baseOptions?: ParseErrorOptions) {
  return (error: unknown, perCallOptions?: ParseErrorOptions) => {
    const mergedOptions: ParseErrorOptions = {
      ...baseOptions,
      ...perCallOptions,
      matchers: [...(baseOptions?.matchers ?? []), ...(perCallOptions?.matchers ?? [])],
    };

    return parseError(error, mergedOptions);
  };
}

function isNetworkError(error: unknown, disableOfflineDetection: boolean): boolean {
  const message = getMessage(error);

  const isOffline =
    !disableOfflineDetection &&
    typeof navigator !== 'undefined' &&
    typeof navigator.onLine === 'boolean' &&
    navigator.onLine === false;

  return (
    getName(error) === 'NetworkError' ||
    getCode(error) === 'NETWORK_ERROR' ||
    message.toLowerCase().includes('fetch') ||
    message.toLowerCase().includes('network') ||
    isOffline
  );
}

function isValidationError(error: unknown): boolean {
  const code = getCode(error);
  const status = getStatus(error);

  return (
    getName(error) === 'ValidationError' ||
    code?.startsWith('VALIDATION') ||
    status === 400 ||
    status === 422
  );
}

function isAuthError(error: unknown): boolean {
  const message = getMessage(error).toLowerCase();
  const status = getStatus(error);

  return (
    status === 401 ||
    status === 403 ||
    getCode(error) === 'UNAUTHORIZED' ||
    message.includes('unauthorized') ||
    message.includes('forbidden')
  );
}

function isServerError(error: unknown): boolean {
  const status = getStatus(error);

  return (
    (typeof status === 'number' && status >= 500) ||
    getCode(error) === 'INTERNAL_SERVER_ERROR'
  );
}

function mapKnownErrors(error: unknown): HumanError | null {
  const message = getMessage(error).toLowerCase();
  
  if (message.includes('unique constraint')) {
    return {
      type: 'validation',
      title: 'Duplicate Entry',
      message: 'This information already exists in our system.',
      action: 'Please use different information or check if you already have an account.',
      code: 'ERR_DUPLICATE',
      retryable: false,
    };
  }

  if (message.includes('foreign key constraint')) {
    return {
      type: 'validation',
      title: 'Reference Not Found',
      message: 'The item you are referring to does not exist or has been deleted.',
      action: 'Please refresh the page and try again.',
      code: 'ERR_REFERENCE',
      retryable: true,
    };
  }

  if (message.includes('cannot read property') || message.includes('undefined')) {
    return {
      type: 'unknown',
      title: 'Application Error',
      message: 'A technical glitch occurred while loading this feature.',
      action: 'Please refresh the page to continue.',
      code: 'ERR_RUNTIME',
      retryable: true,
    };
  }

  return null;
}