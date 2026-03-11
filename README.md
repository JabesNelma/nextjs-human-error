# nextjs-human-error

Human-friendly error handling for Next.js and React applications.

Turn technical errors into clear, actionable messages users can understand.

![npm version](https://img.shields.io/npm/v/nextjs-human-error)
![license](https://img.shields.io/npm/l/nextjs-human-error)

## Features

- Converts unknown runtime/API errors into user-friendly messages
- Built-in parser for network, validation, auth, server, and unknown errors
- Custom error matcher support via `createErrorParser` and `parseError` options
- React hook `useHumanError` with retry handling and lifecycle callbacks
- Ready-to-use `ErrorToast` component with configurable labels and auto-close
- Type-safe helpers: `isHumanError` and `ensureHumanError`

## Installation

```bash
npm install nextjs-human-error
```

## Quick Start

```tsx
'use client';

import { ErrorToast, useHumanError } from 'nextjs-human-error';

export default function CheckoutForm() {
  const { error, showError, clearError, retry } = useHumanError();

  const submitOrder = async () => {
    try {
      await fetch('/api/orders', { method: 'POST' });
    } catch (err) {
      showError(err, {
        retryAction: submitOrder,
      });
    }
  };

  return (
    <>
      <button onClick={submitOrder}>Place order</button>

      {error && (
        <ErrorToast
          error={error}
          onClose={clearError}
          onRetry={retry}
          retryLabel="Try submit again"
        />
      )}
    </>
  );
}
```

## Core API

### `parseError(error, options?)`

Parse unknown errors into `HumanError`.

```ts
import { parseError } from 'nextjs-human-error';

const humanError = parseError(apiError);
```

### `createErrorParser(baseOptions?)`

Create a reusable parser instance with app-level custom rules.

```ts
import { createErrorParser } from 'nextjs-human-error';

const parseAppError = createErrorParser({
  matchers: [
    {
      when: (error) =>
        typeof error === 'object' &&
        error !== null &&
        'status' in error &&
        (error as { status?: number }).status === 429,
      toHumanError: {
        type: 'server',
        title: 'Too Many Requests',
        message: 'You are sending requests too quickly.',
        action: 'Wait a moment and try again.',
        code: 'ERR_RATE_LIMIT',
        retryable: true,
      },
    },
  ],
});
```

### `useHumanError(options?)`

React hook for managing error state.

```ts
const {
  error,
  hasError,
  lastRawError,
  showError,
  clearError,
  setError,
  retry,
} = useHumanError({
  onError: (humanError, originalError) => {
    console.error('Captured:', humanError, originalError);
  },
  onRetryError: (humanError, retryError) => {
    console.error('Retry failed:', humanError, retryError);
  },
});
```

### `ErrorToast`

Built-in UI component to display `HumanError` quickly.

Props:

- `error: HumanError`
- `onClose: () => void`
- `onRetry?: () => void`
- `retryLabel?: string` (default: `"Try Again"`)
- `closeLabel?: string` (default: `"Close error notification"`)
- `autoCloseMs?: number` (default: `8000`)

## Utility Helpers

```ts
import { ensureHumanError, isHumanError } from 'nextjs-human-error';

const safeError = ensureHumanError(unknownError);

if (isHumanError(safeError)) {
  console.log(safeError.title);
}
```

## Type Reference

```ts
type ErrorType = 'network' | 'validation' | 'server' | 'auth' | 'unknown';

interface HumanError {
  type: ErrorType;
  title: string;
  message: string;
  action?: string;
  code?: string;
  retryable: boolean;
}
```

## Requirements

- Next.js 13+
- React 18+
- TypeScript 5+

## Contributing

We welcome contributions from everyone! Whether you're fixing bugs, adding features, improving documentation, or sharing ideas, your help is appreciated.

### Getting Started

1. **Fork the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/nextjs-human-error.git
   cd nextjs-human-error
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development**
   ```bash
   npm run dev
   ```

4. **Build the project**
   ```bash
   npm run build
   ```

### How to Contribute

- **Report bugs**: Open an [issue](https://github.com/JabesNelma/nextjs-human-error/issues) with a clear description and reproduction steps
- **Suggest features**: Share your ideas in [discussions](https://github.com/JabesNelma/nextjs-human-error/discussions)
- **Submit PRs**: Open a pull request with your improvements
- **Improve docs**: Help us write better examples and documentation

### Areas We Need Help With

- [ ] Unit tests and test coverage
- [ ] E2E testing examples
- [ ] Custom error matcher recipes
- [ ] Performance optimizations
- [ ] Better error categorization
- [ ] TypeScript strict mode validation
- [ ] Example apps (Next.js, React SPA, etc.)
- [ ] Translations and i18n support

### Development Guidelines

- Use TypeScript for type safety
- Follow existing code style
- Add tests for new features
- Update README for breaking changes
- Keep commits descriptive

### Questions?

Feel free to open a discussion or reach out. All skill levels are welcome!

## License

ISC © Jabes Nelma
