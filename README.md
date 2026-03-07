# nextjs-human-error

🎯 **Human-friendly error handling for Next.js applications**

Transform technical errors into clear, actionable messages your users will actually understand.

![npm version](https://img.shields.io/npm/v/nextjs-human-error)
![license](https://img.shields.io/npm/l/nextjs-human-error)

---

## ✨ Why?

| Before | After |
|--------|-------|
| `Cannot read property 'id' of undefined` | **"Application Error"** - A technical glitch occurred while loading this feature. |
| `500 Internal Server Error` | **"Server Error"** - Our server encountered a problem. Please try again. |
| `Failed to fetch` | **"Connection Lost"** - Check your Wi-Fi or mobile data connection. |

---

## 🚀 Installation

```bash
npm install nextjs-human-error

📖 Quick Start
1. Use the Hook in Your Component
TypeScript
Copy

'use client';

import { useHumanError, ErrorToast } from 'nextjs-human-error';

export default function MyComponent() {
  const { error, showError, clearError, retry } = useHumanError();

  const handleSubmit = async () => {
    try {
      await fetch('/api/submit', { method: 'POST' });
    } catch (err) {
      showError(err); // Automatically shows human-friendly error!
    }
  };

  return (
    <div>
      <button onClick={handleSubmit}>Submit</button>
      
      {error && (
        <ErrorToast 
          error={error} 
          onClose={clearError}
          onRetry={retry}
        />
      )}
    </div>
  );
}

🎨 Error Types
Table
Type	Icon	Color	Use Case
Network	🌐	Blue	Connection issues, offline
Validation	⚠️	Yellow	Form errors, invalid input
Auth	🔒	Red	Login expired, no permission
Server	🔧	Purple	500 errors, server down
Unknown	💥	Gray	Unexpected errors
🔧 Advanced Usage
Parse Error Manually
TypeScript
Copy

import { parseError } from 'nextjs-human-error';

const humanError = parseError(apiError);
console.log(humanError.title);      // "Connection Lost"
console.log(humanError.message);    // "Unable to connect to the server..."
console.log(humanError.action);     // "Check your Wi-Fi..."
console.log(humanError.retryable);  // true

Custom Styling
The ErrorToast component uses inline styles by default. You can override by wrapping it:
TypeScript
Copy

<div className="my-custom-wrapper">
  <ErrorToast error={error} onClose={clearError} />
</div>

📦 API Reference
useHumanError()
Table
Property	Type	Description
error	HumanError | null	Current error state
showError(err)	(any) => void	Parse and show error
clearError()	() => void	Hide error toast
retry()	() => void	Retry last error
HumanError Interface
TypeScript
Copy

interface HumanError {
  type: 'network' | 'validation' | 'auth' | 'server' | 'unknown';
  title: string;        // "Connection Lost"
  message: string;      // User-friendly description
  action?: string;      // Suggested solution
  code?: string;        // Error code for debugging
  retryable: boolean;   // Show retry button?
}

🛠️ Requirements

    Next.js 13+
    React 18+
    TypeScript (recommended)

🤝 Contributing
Contributions welcome! Please open an issue or pull request.
📄 License
MIT © Jabes Nelma
Made with ❤️ for better user experiences