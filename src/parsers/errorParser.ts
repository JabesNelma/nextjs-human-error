import { HumanError, ErrorType } from '../types';

export function parseError(error: any): HumanError {
  const defaultError: HumanError = {
    type: 'unknown',
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again later.',
    action: 'If the problem persists, contact support.',
    retryable: false,
  };

  if (isNetworkError(error)) {
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
      message: error.message || 'The information you entered is not valid.',
      action: 'Please check your input and try again.',
      code: error.code || 'ERR_VALIDATION',
      retryable: true,
    };
  }

  if (isAuthError(error)) {
    return {
      type: 'auth',
      title: 'Access Denied',
      message: 'Your session has expired or you do not have permission to perform this action.',
      action: 'Please sign in again to continue.',
      code: error.code || 'ERR_AUTH',
      retryable: true,
    };
  }

  if (isServerError(error)) {
    return {
      type: 'server',
      title: 'Server Error',
      message: 'Our server encountered a problem processing your request. This is temporary.',
      action: 'Please wait a moment and try again.',
      code: error.code || 'ERR_SERVER',
      retryable: true,
    };
  }

  const knownError = mapKnownErrors(error);
  if (knownError) return knownError;

  return defaultError;
}

function isNetworkError(error: any): boolean {
  return (
    error?.name === 'NetworkError' ||
    error?.code === 'NETWORK_ERROR' ||
    error?.message?.includes('fetch') ||
    error?.message?.includes('network') ||
    !navigator?.onLine
  );
}

function isValidationError(error: any): boolean {
  return (
    error?.name === 'ValidationError' ||
    error?.code?.startsWith('VALIDATION') ||
    error?.status === 400 ||
    error?.status === 422
  );
}

function isAuthError(error: any): boolean {
  return (
    error?.status === 401 ||
    error?.status === 403 ||
    error?.code === 'UNAUTHORIZED' ||
    error?.message?.includes('unauthorized') ||
    error?.message?.includes('forbidden')
  );
}

function isServerError(error: any): boolean {
  return (
    error?.status >= 500 ||
    error?.code === 'INTERNAL_SERVER_ERROR'
  );
}

function mapKnownErrors(error: any): HumanError | null {
  const message = error?.message?.toLowerCase() || '';
  
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