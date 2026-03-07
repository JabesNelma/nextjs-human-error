import { HumanError } from '../types';
import { parseError } from '../parsers/errorParser';

export function isHumanError(value: unknown): value is HumanError {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const candidate = value as Partial<HumanError>;

  return (
    typeof candidate.type === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.message === 'string' &&
    typeof candidate.retryable === 'boolean'
  );
}

export function ensureHumanError(value: unknown): HumanError {
  return isHumanError(value) ? value : parseError(value);
}
